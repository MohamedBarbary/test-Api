const Job = require("../models/jobModel");

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      user: req.user._id, // auto connect logged user
    });
    res.status(201).json({ status: "success", job });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Get all jobs (admin only)
exports.getAllJobs = async (req, res) => {
  try {
    const { userId } = req.query;

    let filter = {};
    if (userId) {
      filter.user = userId;
    }

    const jobs = await Job.find(filter).populate("user", "fullName phone");

    res.status(200).json({
      status: "success",
      results: jobs.length,
      jobs,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Get user’s own jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id });
    res.status(200).json({ status: "success", results: jobs.length, jobs });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// UPDATE job — admin only
exports.updateJob = async (req, res) => {
  try {
    // Check if job exists
    const job = await Job.findById(req.params.id);
    if (!job)
      return res.status(404).json({ status: "fail", message: "Job not found" });

    // Admin-only logic
    if (!req.user.admin)
      return res
        .status(403)
        .json({ status: "fail", message: "Admin privileges required" });

    // Update job
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: "success", job: updated });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// DELETE job — admin only
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job)
      return res.status(404).json({ status: "fail", message: "Job not found" });

    if (!req.user.admin)
      return res
        .status(403)
        .json({ status: "fail", message: "Admin privileges required" });

    await Job.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
