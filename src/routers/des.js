//express package helps in routing and managing the server endpoints
const express = require("express");
//crypto-js package has libraries for encryption e.g AES and DES
var cryptoJS = require("crypto-js");
//nodemailer package helps in sending emails
var nodemailer = require("nodemailer");
//cors provides a express middleware that can be used to enable CORS with various options
var cors = require("cors");
//only allow requests from originating from https://bridgetcrypt.github.io
var corsOptions = {
  origin: "https://bridgetcrypt.github.io",
  optionsSuccessStatus: 200,
};
//creates a new instance of router that helps managing server endpoints
const router = new express.Router();

// variables for the various Twilio API variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

//creating the first endpoint that manages encryption requests
router.get("/encrypt", cors(corsOptions), async (req, res) => {
  const message = req.query.message;
  const key = req.query.key;
  const email = req.query.email;
  const phoneNumber = req.query.phoneNumber;

  var cipherMessage = encryptMessage(message, key);
  try {
    sendEncryptedMessage(email, cipherMessage);
    if (phoneNumber != "") sendKey(key, phoneNumber);
    res.status(200).send(cipherMessage);
  } catch (error) {
    res.status(400).send(error);
  }
});

//creating the second endpoint that manages decryption requests
router.get("/decrypt", cors(corsOptions), async (req, res) => {
  const cipherMessage = req.query.cipherMessage;
  const key = req.query.key;
  var originalMessage = decryptMessage(cipherMessage, key);

  //error checking. If text is "", then encryption was unsuccessful
  if ((originalText = "")) {
    res.status(400).send("Could not decrypt message");
  } else {
    res.status(200).send(originalMessage);
  }
});

//encrypt using DES
function encryptMessage(message, key) {
  var cipherMessage = cryptoJS.DES.encrypt(message, key).toString();
  return cipherMessage;
}

//decrypt using DES
function decryptMessage(cipherMessage, key) {
  var bytes = cryptoJS.DES.decrypt(cipherMessage, key);
  var originalMessage = bytes.toString(cryptoJS.enc.Utf8);
  return originalMessage;
}

//send the key via SMS
function sendKey(key, phoneNumber) {
  client.messages
    .create({ body: key, from: twilioPhoneNumber, to: "+" + phoneNumber })
    .then((message) => console.log(message.sid))
    .catch((error) => {
      throw error;
    });
}

//send the encrypted message via email
function sendEncryptedMessage(toEmail, message) {
  throw "Could not send message";
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
    text: `This is an encrypted message.\nA decryption key has been sent to you via SMS.\n\n${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) throw error;
  });
}

module.exports = router;
