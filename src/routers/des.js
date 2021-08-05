//express package helps in routing and managing the server endpoints
const express = require("express");
//crypto-js package has libraries for encryption e.g AES and DES
var cryptoJS = require("crypto-js");
//nodemailer package helps in sending emails
var nodemailer = require("nodemailer");

//creates a new instance of router that helps managing server endpoints
const router = new express.Router();

// variables for the various Twilio API variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

//creating the first endpoint that manages encryption requests
router.get("/encrypt", async (req, res) => {
  const message = req.query.message;
  const key = req.query.key;
  const email = req.query.email;
  const phoneNumber = req.query.phoneNumber;

  var cipherText = encryptMessage(message, key);
  try {
    sendEncryptedMessage(email, cipherText);
    if (phoneNumber != "") sendKey(key, phoneNumber);
    res.status(200).send(cipherText);
  } catch (error) {
    res.status(400).send(error);
  }
});

//creating the second endpoint that manages decryption requests
router.get("/decrypt", async (req, res) => {
  const cipherText = req.query.cipherText;
  const key = req.query.key;
  var originalText = decryptMessage(cipherText, key);

  //error checking. If text is "", then encryption was unsuccessful
  if ((originalText = "")) {
    res.status(400).send("Could not decrypt message");
  } else {
    res.status(200).send(originalText);
  }
});

//encrypt using DES
function encryptMessage(message, key) {
  var cipherText = cryptoJS.DES.encrypt(message, key).toString();
  return cipherText;
}

//decrypt using DES
function decryptMessage(cipherText, key) {
  var bytes = cryptoJS.DES.decrypt(cipherText, key);
  var originalText = bytes.toString(cryptoJS.enc.Utf8);
  return originalText;
}

//send the key via SMS
function sendKey(key, phoneNumber) {
  client.messages
    .create({ body: key, from: twilioPhoneNumber, to: "+" + phoneNumber })
    .then((message) => console.log(message.sid))
    .catch((e) => console.log(e));
}

//send the encrypted message via email
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
    text: `This is an encrypted message.\nA decryption key has been sent to you via SMS.\n\n${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) throw error;
  });
}

module.exports = router;