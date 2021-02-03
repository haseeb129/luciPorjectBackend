const mongoose = require("mongoose");

const authSchema = mongoose.Schema({
  // _id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  // },

  email: {
    type: String,
  },

  firstName: {
    type: String,
  },

  lastName: {
    type: String,
  },
  address: {
    type: String,
  },
  townCity: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  instantStrategy: {
    type: String,
    required: true,
  },

  userName: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Auth", authSchema);
