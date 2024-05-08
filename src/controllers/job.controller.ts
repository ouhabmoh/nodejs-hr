import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { jobService } from '../services';
import { User } from '@prisma/client';

// Job controllers
const createJob = catchAsync(async (req, res) => {
  const job = await jobService.createJob(req.body, req.user);
  res.status(httpStatus.CREATED).send(job);
});

const getJobs = catchAsync(async (req, res) => {
  const user = req.user as User;
  const filter = pick(req.query, ['title', 'location', 'employmentType', 'isClosed']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await jobService.queryJobs(filter, user.role, options);
  res.send(result);
});

const getJob = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.params.jobId);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  res.send(job);
});

const updateJob = catchAsync(async (req, res) => {
  const job = await jobService.updateJobById(req.params.jobId, req.body, req.user);
  res.send(job);
});

export default {
  createJob,
  getJobs,
  getJob,
  updateJob
};
