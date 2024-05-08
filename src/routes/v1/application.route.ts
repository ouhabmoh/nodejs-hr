import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { jobValidation } from '../../validations';
import { applicationController } from '../../controllers';
import upload from '../../middlewares/upload';

const router = express.Router();

router
  .route('/')
  .get(
    auth('getApplications'),
    validate(jobValidation.getApplications),
    applicationController.getApplications
  );

export default router;
