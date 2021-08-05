const express = require("express");
var cryptoJS = require("crypto-js");
var nodemailer = require("nodemailer");

const router = new express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

router.get("/encrypt", async (req, res) => {
  const message = req.query.message;
  const key = req.query.key;
  const email = req.query.email;
  const phoneNumber = req.query.phoneNumber;

  try {
    var cipherText = encryptMessage(message, key);
    sendEncryptedMessage(email, cipherText);
    // sendKey(key, phoneNumber);
    res.status(200).send(cipherText);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/decrypt", async (req, res) => {
  const cipherText = req.query.cipherText;
  const key = req.query.key;

  var originalText = decryptMessage(cipherText, key);
  if ((originalText = "")) {
    res.status(400).send();
  } else {
    res.status(200).send(originalText);
  }
});

function encryptMessage(message, key) {
  var cipherText = cryptoJS.DES.encrypt(message, key).toString();
  return cipherText;
}

function decryptMessage(cipherText, key) {
  var bytes = cryptoJS.DES.decrypt(cipherText, key);
  var originalText = bytes.toString(cryptoJS.enc.Utf8);
  return originalText;
}

function sendKey(key, phoneNumber) {
  client.messages
    .create({ body: key, from: twilioPhoneNumber, to: "+" + phoneNumber })
    .then((message) => console.log(message.sid))
    .catch((e) => console.log(e));
}

function sendEncryptedMessage(toEmail, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: "Encrypted Message",
    text: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = router;
