require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');  // MongoDB model

const app = express();
app.use(cors({
  origin: 'https://frontend-v5xj.onrender.com'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');
console.log('TO_EMAIL:', process.env.TO_EMAIL ? 'Loaded' : 'Missing');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error: ', err));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your email address
    pass: process.env.EMAIL_PASS   // Your Gmail App Password
  }
});

// User model (User.js)
app.use((req, res, next) => {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).end();
  } else {
    next();
  }
});

app.post('/login', async (req, res) => {
  try {
    const { name, email , message } = req.body;

    // Save user data to MongoDB
    const user = new User({ name, email ,message});
    await user.save();

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: 'New Login Notification',
      text: `New user logged in:\nName: ${name}\nEmail: ${email}\nMessage:${message}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Mail sending error:', err);
        return res.status(500).send('Error sending email');
      }
      res.status(200).send('Login recorded and email sent!');
    });
  } catch (error) {
    console.error('Error in /login route:', error.stack || error);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
