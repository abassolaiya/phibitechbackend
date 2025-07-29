const asyncHandler = require('express-async-handler');
const Job = require('../../models/jobs/jobModel');

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().sort('-timestamp');
  res.json(jobs);
});

const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

const createJob = asyncHandler(async (req, res) => {
  const job = new Job({
    position: req.body.position,
    details: req.body.details,
    link: req.body.link,
    location: req.body.location,
    organization: req.body.organization,
    mode: req.body.mode,
  });
  const createdJob = await job.save();
  res.status(201).json(createdJob);
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    job.position = req.body.position || job.position;
    job.details = req.body.details || job.details;
    job.link = req.body.link || job.link;
    job.location = req.body.location || job.location;
    job.organization = req.body.organization || job.organization;
    job.mode = req.body.mode || job.mode;
    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    await job.remove();
    res.json({ message: 'Job removed' });
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob };