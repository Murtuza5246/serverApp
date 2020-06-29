const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  authType: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: {
    type: String,
    required: true,
  },
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  pString: { type: String },
  contact: { type: Number },
  dob: { type: String },
  cName: { type: String },
  cAddress: { type: String },
  city: { type: String },
  nState: { type: String },
  pCode: { type: String },
  experience: { type: String },
  creationDate: { type: String },
  creationTime: { type: String },
  profileImage: { type: String },
  savedStatements: { type: Array },
  profileImageId: { type: String },
  //TODO: MAKE DIFFERENT ENDPOINTS FOR EVER DIFFERENT USER FROM DROP DOWN CHOOSE FILES ACCORDING TO THAT END POINTS WILL GET CHANGED
});

const Order = mongoose.model("User", userSchema);
module.exports = Order;
