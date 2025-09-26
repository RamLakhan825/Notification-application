// const cron = require('node-cron');
// const Alert = require('../models/Alert');
// const User = require('../models/User');
// const { sendEmail, sendSMS } = require('../utils/notifications');

// cron.schedule('*/5 * * * *', async () => { // every 5 minutes
//   const now = new Date();
//   const alerts = await Alert.find({ active: true, expiryTime: { $gt: now } });

//   for (let alert of alerts) {
//     for (let userId of alert.visibility.users) {
//       const user = await User.findById(userId);

//       const lastSentEntry = alert.lastSent.find(ls => ls.user.toString() === userId.toString());
//       let sendNow = !lastSentEntry || ((now - lastSentEntry.time) / 1000 / 60 / 60 >= alert.reminderFrequency);

//       if (sendNow) {
//         try {
//           if (alert.deliveryType === 'Email') await sendEmail(user.email, alert.title, alert.message);
//           else if (alert.deliveryType === 'SMS') await sendSMS(user.phone, alert.message);
//         } catch (err) {
//           console.error(`Failed sending to ${user.email || user.phone}:`, err);
//         }

//         if (lastSentEntry) lastSentEntry.time = now;
//         else alert.lastSent.push({ user: userId, time: now });
//       }
//     }
//     await alert.save();
//   }
// });

const cron = require('node-cron'); // ✅ add this
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendEmail, sendSMS } = require('../utils/notifications');
const { io } = require('../server'); // keep this

cron.schedule('*/5 * * * *', async () => { // every 5 minutes
  const now = new Date();
  const alerts = await Alert.find({ active: true, expiryTime: { $gt: now } });

  for (let alert of alerts) {
    const userIds = alert.visibility.users || [];
    for (let userId of userIds) {
      const user = await User.findById(userId);
      if(!user) continue;

      const snoozed = alert.snoozedUsers?.find(
        s => s.user.toString() === userId.toString() &&
             new Date(s.snoozedDate).toDateString() === now.toDateString()
      );
      if (snoozed) continue;

      const lastSentEntry = alert.lastSent.find(ls => ls.user.toString() === userId.toString());
      let sendNow = !lastSentEntry || ((now - lastSentEntry.time) / 1000 / 60 / 60 >= alert.reminderFrequency);

      if (sendNow) {
        try {
          // Send Email/SMS if required
          if (alert.deliveryType === 'Email') await sendEmail(user.email, alert.title, alert.message);
          else if (alert.deliveryType === 'SMS') await sendSMS(user.phone, alert.message);

          // Emit real-time event to frontend
          io.to(userId.toString()).emit('newAlert', alert);

        } catch (err) {
          console.error(`Failed sending to ${user.email || user.phone}:`, err);
        }

        if (lastSentEntry) lastSentEntry.time = now;
        else alert.lastSent.push({ user: userId, time: now });
      }
    }
    await alert.save();
  }
});

