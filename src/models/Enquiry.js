const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Enquiry", EnquirySchema);
