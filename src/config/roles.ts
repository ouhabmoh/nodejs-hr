import { Role } from '@prisma/client';

const allRoles = {
  [Role.CANDIDATE]: ['getJobs', 'applyJob', 'getApplications', 'getApplication'],
  [Role.RECRUITER]: [
    'manageJobs',
    'getJobs',
    'reviewApplication',
    'getApplications',
    'getApplication',
    'getUsers'
  ],
  [Role.ADMIN]: ['getUsers', 'manageUsers']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
