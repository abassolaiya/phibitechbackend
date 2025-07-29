// const express = require("express");
// const router = express.Router();
// const consultationController = require("../controllers/consultationController");

// router.post("/", consultationController.requestConsultation);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  requestConsultation,
  listConsultations,
} = require("../controllers/consultationController");
const { ensureAuthenticated } = require("../middleware/auth");

router.post("/", requestConsultation); // public
router.get("/", ensureAuthenticated, listConsultations); // protected admin view

module.exports = router;
