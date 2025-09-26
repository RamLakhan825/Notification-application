# 📢 Notification Application

A lightweight alerting and notification system that allows admins to create and deliver alerts, while end users can receive and manage them in real-time.  
Built with **Node.js, Express, MongoDB, and Socket.io**.

---

## 🚀 Features

- **Admin Panel**
  - Create, update, and delete alerts
  - Choose delivery type (In-App, Email, SMS)
  - Manage severity levels (Info, Warning, Critical)

- **End User**
  - Receive real-time alerts via WebSocket
  - View alerts in dashboard
  - Mark alerts as read/unread

- **Other**
  - Secure authentication with JWT
  - Role-based access (Admin & End User)
  - Configurable alert scheduler

---

## 🔑 Admin Credentials
Email: admin@gmail.com
Password: 123456789

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose ORM)  
- **Authentication**: JWT  
- **Real-time**: Socket.io  
- **Scheduler**: Node-cron  

---

## 📂 Project Structure

notification-app/
│── .env
│── package.json
│── server.js
│── /routes
│ ├── auth.js
│ ├── alerts.js
│ ├── user.js
│ └── endUser.js
│── /models
│ ├── User.js
│ └── Alert.js
│── /scheduler
│ └── alertScheduler.js

📌 Usage

Login as Admin using the credentials above

Create alerts and assign delivery types

End users will receive notifications in real-time

