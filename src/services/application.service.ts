import { Application } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import jobService from './job.service';
import { uploadFile } from '../utils/fileUpload';
import { ApplicationWithCandidate } from '../types/response';

const applyJob = async (
  jobId: number,
  applicationBody: any,
  file: any,
  currentUser: any
): Promise<Application> => {
  const job = await jobService.getJobById(jobId, ['id', 'isClosed', 'deadline']);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  if (job.deadline < new Date() || job.isClosed) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This job application is closed');
  }
  let resumeFilePath = 'upload';
  try {
    resumeFilePath = await uploadFile(file);
  } catch (err) {
    console.log(err);
  }
  const resume = await prisma.resume.create({
    data: {
      candidateId: currentUser.id,
      filename: resumeFilePath
    }
  });

  return prisma.application.create({
    data: {
      ...applicationBody,
      jobId: job.id,
      candidateId: currentUser.id,
      resumeId: resume.id,
      status: 'pending'
    }
  });
};

const queryApplications = async <Key extends keyof Application>(
  jobId: number,
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = ['id', 'status', 'createdAt', 'updatedAt'] as Key[]
): Promise<ApplicationWithCandidate<Key>[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';

  if (jobId) {
    filter = {
      ...filter,
      jobId
    };
  }
  const applications = await prisma.application.findMany({
    where: {
      ...filter
    },
    select: {
      ...keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });

  return applications.map((application) => ({
    ...application,
    candidate: {
      id: application.candidate.id,
      firstName: application.candidate.firstName,
      lastName: application.candidate.lastName,
      email: application.candidate.email
    }
  })) as ApplicationWithCandidate<Key>[];
};
const getApplicationById = async <Key extends keyof Application>(
  jobId: number,
  applicationId: number,
  keys: Key[] = ['id', 'candidateId', 'status', 'createdAt', 'updatedAt'] as Key[]
): Promise<ApplicationWithCandidate<Key> | null> => {
  const job = await prisma.job.findFirst({
    where: { id: jobId },
    select: {
      id: true,
      title: true
    }
  });

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, jobId },
    select: {
      ...keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
  }

  return {
    ...application,
    candidate: {
      id: application?.candidate.id,
      firstName: application?.candidate.firstName,
      lastName: application?.candidate.lastName,
      email: application?.candidate.email
    }
  } as ApplicationWithCandidate<Key>;
};

const reviewApplication = async <Key extends keyof Application>(
  jobId: number,
  applicationId: number,
  updateBody: any,
  keys: Key[] = ['id', 'status', 'evaluation', 'updatedAt'] as Key[]
): Promise<Pick<Application, Key> | null> => {
  const application = await getApplicationById(jobId, applicationId, ['id']);
  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
  }
  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedApplication as Pick<Application, Key> | null;
};

export default {
  applyJob,
  queryApplications,
  getApplicationById,
  reviewApplication
};
