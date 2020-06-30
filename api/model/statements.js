const mongoose = require("mongoose");

const statementsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  identifier: { type: String, require: true }, //name
  title: { type: String, required: true },
  statement: { type: String, require: true },
  email: { type: String, required: true },
  place: { type: String, required: true },
  identifierData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  field: { type: String, required: true }, // this can be use full to get only related statements likewise this.find({field:this.fiels})
  // imageId: { type: String },
  date: { type: String },
  time: { type: String },
  statementImage: { type: String },
  organization: { type: String },
  organizationLink: { type: String },
  approved: { type: Boolean, required: true },
  profileImage: { type: String },
  actionAdminEmail: { type: String },
  shareEmail: { type: Boolean },
  actionAdminName: { type: String },
  actionAdminDate: { type: String },
  actionAdminTime: { type: String },
  comments: { type: Array },
  link: { type: String },
  userId: { type: String, required: true },
  linkTitle: { type: String },
});

const statement = mongoose.model("Statements", statementsSchema);
module.exports = statement;
