import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { jobValidation } from '../../validations';
import { jobController, applicationController } from '../../controllers';
import upload from '../../middlewares/upload';

const router = express.Router();

// Job routes
router
  .route('/')
  .post(auth('manageJobs'), validate(jobValidation.createJob), jobController.createJob)
  .get(auth('getJobs'), validate(jobValidation.getJobs), jobController.getJobs);

router
  .route('/:jobId')
  .get(auth('getJobs'), validate(jobValidation.getJob), jobController.getJob)
  .patch(auth('manageJobs'), validate(jobValidation.updateJob), jobController.updateJob);

// Application routes
router
  .route('/:jobId/applications')
  .post(auth('applyJob'), upload, validate(jobValidation.applyJob), applicationController.applyJob)
  .get(
    auth('getApplications'),
    validate(jobValidation.getApplications),
    applicationController.getApplications
  );

router
  .route('/:jobId/applications/:applicationId')
  .get(
    auth('getApplication'),
    validate(jobValidation.getApplication),
    applicationController.getApplication
  )
  .patch(
    auth('reviewApplication'),
    validate(jobValidation.reviewApplication),
    applicationController.reviewApplication
  );

export default router;
