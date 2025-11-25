const express = require("express");
const { protect, adminOnly } = require("../controllers/authController");
const jobController = require("../controllers/jobController");

const router = express.Router();

router.get("/all", protect, adminOnly, jobController.getAllJobs);

router.route("/").post(protect, jobController.createJob);

router.get("/my", protect, jobController.getMyJobs);

router
  .route("/:id")
  .patch(protect, adminOnly, jobController.updateJob)
  .delete(protect, adminOnly, jobController.deleteJob);

module.exports = router;
