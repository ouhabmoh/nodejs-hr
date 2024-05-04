import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { jobValidation } from '../../validations';
import { applicationController } from '../../controllers';
import upload from '../../middlewares/upload';

const router = express.Router();

// Application routes
router
  .route('/:jobId/applications')
  .post(
    auth('applyJob'),
    upload.single('resume'),
    validate(jobValidation.applyJob),
    applicationController.applyJob
  )
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
