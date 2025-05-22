require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');

const app = express();

// Allow frontend origin
app.use(cors({
  origin: 'https://frontend-v5xj.onrender.com',
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Debug .env status
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');
console.log('TO_EMAIL:', process.env.TO_EMAIL ? 'Loaded' : 'Missing');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Handle favicon
app.use((req, res, next) => {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).end();
  } else {
    next();
  }
});

// 🔵 POST Route
app.post('/login', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const user = new User({ name, email, message });
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email error:', err);
        return res.status(500).send('Error sending email');
      }
      res.status(200).send('Contact saved and email sent!');
    });

  } catch (error) {
    console.error('Error in POST /login:', error);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
