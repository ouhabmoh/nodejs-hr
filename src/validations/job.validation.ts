import Joi from 'joi';

const createJob = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    department: Joi.string().required(),
    location: Joi.string().required()
  })
};

const getJobs = {
  query: Joi.object().keys({
    title: Joi.string(),
    department: Joi.string(),
    location: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getJob = {
  params: Joi.object().keys({
    jobId: Joi.number().integer().required()
  })
};

const updateJob = {
  params: Joi.object().keys({
    jobId: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    department: Joi.string(),
    location: Joi.string()
  })
};

const deleteJob = {
  params: Joi.object().keys({
    jobId: Joi.number().integer().required()
  })
};

const applyJob = {
  params: Joi.object().keys({
    jobId: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    candidateName: Joi.string().required(),
    email: Joi.string().email().required(),
    resume: Joi.string().required(),
    coverletter: Joi.string().required()
  })
};

const getApplications = {
  params: Joi.object().keys({
    jobId: Joi.number().integer().required()
  }),
  query: Joi.object().keys({
    status: Joi.string(),
    candidateName: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getApplication = {
  params: Joi.object().keys({
    jobId: Joi.number().integer().required(),
    applicationId: Joi.number().integer().required()
  })
};

const reviewApplication = {
  params: Joi.object().keys({
    jobId: Joi.number().integer().required(),
    applicationId: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'accepted', 'rejected').required()
  })
};

export const jobValidation = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyJob,
  getApplications,
  getApplication,
  reviewApplication
};
