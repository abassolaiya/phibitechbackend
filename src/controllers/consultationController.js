const Consultation = require("../models/consultation/Consultation");

exports.requestConsultation = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const newConsultation = new Consultation({ name, email, phone, message });
    await newConsultation.save();
    res.status(201).json({ message: "Consultation request sent!" });
  } catch (err) {
    res.status(400).json({ error: "Failed to submit consultation." });
  }
};

exports.listConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ date: -1 });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch consultations." });
  }
};
