import Joi from 'joi';

const createJob = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    employmentType: Joi.string()
      .valid('full-time', 'part-time', 'contract', 'internship')
      .required(),
    deadline: Joi.date().greater(new Date()).required()
  })
};

const getJobs = {
  query: Joi.object().keys({
    title: Joi.string(),
    location: Joi.string(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship'),
    sortBy: Joi.string(),
    isClosed: Joi.boolean(),
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
    location: Joi.string(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship'),
    isClosed: Joi.boolean(),
    deadline: Joi.date().greater(new Date())
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
    coverletter: Joi.string()
  })
};

const getApplications = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'accepted', 'rejected'),
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
    status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
    evaluation: Joi.number()
  })
};

export default {
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
