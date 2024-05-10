import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { applicationService } from '../services';

const applyJob = catchAsync(async (req, res) => {
  console.log('sssssssssssssssssssssssssssssssssssss\nsssssssssssssssssssssssssssss');
  console.log(req.file);
  console.log(req.resume);
  const application = await applicationService.applyJob(
    req.params.jobId,
    req.body,
    req.file,
    req.user
  );
  res.status(httpStatus.CREATED).send(application);
});

const getApplications = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await applicationService.queryApplications(req.params.jobId, filter, options);
  res.send(result);
});

const getApplication = catchAsync(async (req, res) => {
  const application = await applicationService.getApplicationById(
    req.params.jobId,
    req.params.applicationId
  );
  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
  }
  res.send(application);
});

const reviewApplication = catchAsync(async (req, res) => {
  const application = await applicationService.reviewApplication(
    req.params.jobId,
    req.params.applicationId,
    req.body
  );
  res.send(application);
});

export default {
  applyJob,
  getApplications,
  getApplication,
  reviewApplication
};
