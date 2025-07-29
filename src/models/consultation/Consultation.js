const mongoose = require("mongoose");

const ConsultationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  dateRequested: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Consultation", ConsultationSchema);
