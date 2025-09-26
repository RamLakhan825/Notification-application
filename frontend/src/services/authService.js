import axios from 'axios';

const API_URL = 'https://notification-application.onrender.com/api/auth/';

export const login = async (email, password) => {
  const res = await axios.post(API_URL + 'login', { email, password });
  return res.data;
};
