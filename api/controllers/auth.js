const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../models/auth");
const Role = require("../models/roles");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const auth = require("../models/auth");

module.exports.signup = (req, res, next) => {
  console.log(req.body);
  const {
    firstName,
    lastName,
    address,
    townCity,
    state,
    zipCode,
    instantStrategy,
    userName,
    password,
    email,
  } = req.body;
  var hashp;
  Auth.findOne({ email: email })
    .exec()
    .then(async (authObj) => {
      if (authObj) {
        res.status(403).json({
          message: "user Name already registered",
        });
      } else {
        await bcrypt.hash(password, saltRounds, function (err, hash) {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            hashp = hash;
            const auth = new Auth({
              password: hash,
              email: email,
              firstName: firstName,
              lastName: lastName,
              address: address,
              townCity: townCity,
              state: state,
              zipCode: zipCode,
              instantStrategy: instantStrategy,
              userName: userName,
            });

            auth
              .save()
              .then(async (result) => {
                console.log("User object Saved", result);
                const token = jwt.sign(
                  {
                    _id: result._id,
                    email,
                    firstName,
                    lastName,
                    address,
                    townCity,
                    state,
                    zipCode,
                    instantStrategy,
                    userName,
                  },
                  "secret",
                  { expiresIn: "5d" }
                );
                console.log("Result", result);
                console.log("token", token);
                res.status(201).json({
                  message: "sign up successful",
                  token: token,
                });
              })
              .catch((err) => {
                console.log("Not saved");
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
};

module.exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Auth.findOne({ email: email })
    .exec()
    .then(async (auth) => {
      if (auth) {
        await bcrypt.compare(
          password,
          auth.password,
          async function (err, newResult) {
            if (err) {
              return res.status(501).json({
                error: err,
              });
            } else {
              if (newResult) {
                const {
                  _id,
                  firstName,
                  lastName,
                  address,
                  townCity,
                  state,
                  zipCode,
                  instantStrategy,
                  userName,
                  password,
                  email,
                } = auth;

                const token = jwt.sign(
                  {
                    _id,
                    email,
                    firstName,
                    lastName,
                    address,
                    townCity,
                    state,
                    zipCode,
                    instantStrategy,
                    userName,
                  },
                  "secret",
                  { expiresIn: "5d" }
                );
                return res.status(200).json({
                  token: token,
                  user: auth,
                });
              } else {
                return res.status(401).json({
                  message: "invalid password",
                });
              }
            }
          }
        );
      } else {
        res.status(404).json({
          message: "email invalid",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

module.exports.forgetPassword = (req, res, next) => {
  console.log(req.body);
  const { email } = req.body;

  Auth.findOne({ email: email })
    .exec()
    .then(async (authObj) => {
      if (authObj) {
        console.log("Object Found", authObj);
        const token = jwt.sign(
          {
            _id: authObj._id,
            email: authObj.email,
            firstName: authObj.firstName,
            lastName: authObj.lastName,
            address: authObj.address,
            townCity: authObj.townCity,
            state: authObj.state,
            zipCode: authObj.zipCode,
            instantStrategy: authObj.instantStrategy,
            userName: authObj.userName,
          },
          "secret",
          { expiresIn: "60d" }
        );
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.user,
            pass: process.env.pass,
          },
        });

        var mailOptions = {
          from: process.env.email,
          to: `${email}`,
          subject: "Account activation link",
          html: `
                            <h2>please click on the following link to activate your account</h2>
                            <a href="http://192.168.18.9:3001/active/${token}"> ${process.env.CLIENT_URL}/auth/activate/${token} </a>
                            `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });

        res.status(201).json({
          message: "please check your email for account activation",
        });
      } else {
        res.status(403).json({
          message: "Email Not found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

module.exports.updatePassword = (req, res, next) => {
  console.log("request received", req.body);
  const id = req.body._id;
  const password = req.body.password;
  Auth.findById(id)
    .exec()
    .then(async (foundObject) => {
      console.log("updatePassword", foundObject);
      await bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          return res.state(500).json({
            error: err,
          });
        } else {
          foundObject.password = hash;
          foundObject
            .save()
            .then(() => {
              res.status(201).json({
                message: "password updated successfully",
              });
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        }
      });
    })
    .catch((err) => {
      console.log("Error Occur", err.message);
      res.status(500).json({
        error: err,
      });
    });
};
