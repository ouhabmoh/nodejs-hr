import { Job, Role } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

// Job service
const createJob = async (jobBody: any, currentUser: any): Promise<Job> => {
  return prisma.job.create({
    data: {
      ...jobBody,
      recruiterId: currentUser.id
    }
  });
};

const queryJobs = async <Key extends keyof Job>(
  filter: object,
  userRole: Role,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'title',
    'description',
    'location',
    'employmentType',
    'isClosed',
    'deadline',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Job, Key>[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';
  if (userRole === Role.CANDIDATE) {
    filter = {
      ...filter,
      isClosed: false,
      deadline: {
        gt: new Date() // Filter for jobs with deadline greater than current date
      }
    };
  }
  const jobs = await prisma.job.findMany({
    where: {
      ...filter
    },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });
  return jobs as Pick<Job, Key>[];
};

const getJobById = async <Key extends keyof Job>(
  id: number,
  keys: Key[] = [
    'id',
    'title',
    'description',
    'location',
    'employmentType',
    'deadline',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Job, Key> | null> => {
  return prisma.job.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Job, Key> | null>;
};

const updateJobById = async <Key extends keyof Job>(
  jobId: number,
  updateBody: any,
  currentUser: any,
  keys: Key[] = [
    'id',
    'title',
    'description',
    'location',
    'isClosed',
    'employmentType',
    'deadline',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Job, Key> | null> => {
  const job = await getJobById(jobId, ['id', 'recruiterId']);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  if (job.recruiterId !== currentUser.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to update this job');
  }
  const updatedJob = await prisma.job.update({
    where: { id: job.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedJob as Pick<Job, Key> | null;
};

export default {
  createJob,
  queryJobs,
  getJobById,
  updateJobById
};
