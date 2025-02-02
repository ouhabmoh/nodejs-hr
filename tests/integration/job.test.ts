// job.test.ts
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/client';
import { Role, TokenType } from '@prisma/client';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { userOne, userTwo, admin, insertUsers } from '../fixtures/user.fixture';
import setupTestDB from '../utils/setupTestDb';
import path from 'path';
import mock from 'mock-fs';
import fs from 'fs';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { promises as fsPromises } from 'fs';
import { emailService, tokenService } from '../../src/services';

import moment from 'moment';

import config from '../../src/config/config';
import jestMockExtended from 'jest-mock-extended';

setupTestDB();

describe('Job Routes', () => {
  jest.mock('fs', () => jestMockExtended);
  let recruiterId: number;
  let accessToken: string;
  let candidateId: number;
  let candidateAccessToken: string;

  const testFileContent = Buffer.from('This is a test file content');
  const testFilePath = path.join(__dirname, 'testFiles', 'test.pdf');

  const fixturesDir = path.join(__dirname, 'resumes');
  console.log(fixturesDir);
  beforeEach(async () => {
    await prisma.job.deleteMany();
    await insertUsers([userOne, userTwo, admin]);

    jest.clearAllMocks();

    // mock({
    //   [testFilePath]: testFileContent,
    // });

    const recruiter = await prisma.user.findUnique({ where: { email: userTwo.email } });
    if (!recruiter) throw new Error('Recruiter not found');

    recruiterId = recruiter.id;
    accessToken = tokenService.generateToken(
      recruiterId,
      moment().add(config.jwt.accessExpirationMinutes, 'minutes'),
      TokenType.ACCESS
    );

    const candidate = await prisma.user.findUnique({ where: { email: userOne.email } });
    if (!candidate) throw new Error('Candidate not found');

    candidateId = candidate.id;
    candidateAccessToken = tokenService.generateToken(
      candidateId,
      moment().add(config.jwt.accessExpirationMinutes, 'minutes'),
      TokenType.ACCESS
    );
  });

  afterEach(async () => {
    await prisma.job.deleteMany();
  });

  describe('POST /v1/jobs', () => {
    it('should create a new job', async () => {
      // Test code...
    });

    it('should return 403 if user is not a recruiter', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'We are hiring a software engineer',
        location: 'New York',
        employmentType: 'full-time',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      await request(app)
        .post('/v1/jobs')
        .set('Authorization', `Bearer ${candidateAccessToken}`)
        .send(jobData)
        .expect(403);
    });
  });

  describe('GET /v1/jobs', () => {
    it('should return jobs for candidates with open deadline', async () => {
      const openJob = await prisma.job.create({
        data: {
          title: 'Software Engineer',
          description: 'We are hiring a software engineer',
          location: 'New York',
          employmentType: 'full-time',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          recruiterId: recruiterId
        }
      });

      const closedJob = await prisma.job.create({
        data: {
          title: 'Frontend Developer',
          description: 'We are hiring a frontend developer',
          location: 'Los Angeles',
          employmentType: 'part-time',
          deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isClosed: true,
          recruiterId: recruiterId
        }
      });

      const res = await request(app)
        .get('/v1/jobs')
        .set('Authorization', `Bearer ${candidateAccessToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(openJob.id);
    });

    it('should return all jobs for recruiters', async () => {
      const openJob = await prisma.job.create({
        data: {
          title: 'Software Engineer',
          description: 'We are hiring a software engineer',
          location: 'New York',
          employmentType: 'full-time',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          recruiterId: recruiterId
        }
      });

      const closedJob = await prisma.job.create({
        data: {
          title: 'Frontend Developer',
          description: 'We are hiring a frontend developer',
          location: 'Los Angeles',
          employmentType: 'part-time',
          deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isClosed: true,
          recruiterId: recruiterId
        }
      });

      const res = await request(app)
        .get('/v1/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveLength(2);
      // @ts-ignore
      expect(res.body.map((job) => job.id)).toContain(openJob.id);
      // @ts-ignore
      expect(res.body.map((job) => job.id)).toContain(closedJob.id);
    });
  });

  describe('GET /v1/jobs/:jobId', () => {
    it('should return a job by id', async () => {
      const job = await prisma.job.create({
        data: {
          title: 'Software Engineer',
          description: 'We are hiring a software engineer',
          location: 'New York',
          employmentType: 'full-time',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          recruiterId: recruiterId
        }
      });

      const res = await request(app)
        .get(`/v1/jobs/${job.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        employmentType: job.employmentType,
        deadline: job.deadline.toISOString(),
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString()
      });
    });

    it('should return 404 if job is not found', async () => {
      const nonExistentJobId = 999;

      await request(app)
        .get(`/v1/jobs/${nonExistentJobId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /v1/jobs/:jobId', () => {
    it('should update a job by id', async () => {
      const job = await prisma.job.create({
        data: {
          title: 'Software Engineer',
          description: 'We are hiring a software engineer',
          location: 'New York',
          employmentType: 'full-time',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          recruiterId: recruiterId
        }
      });

      const updates = {
        title: 'Senior Software Engineer',
        description: 'We are hiring a senior software engineer',
        location: 'San Francisco',
        employmentType: 'contract',
        isClosed: true,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      };

      const res = await request(app)
        .patch(`/v1/jobs/${job.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(200);

      expect(res.body).toEqual({
        id: job.id,
        title: updates.title,
        description: updates.description,
        location: updates.location,
        employmentType: updates.employmentType,
        isClosed: updates.isClosed,
        deadline: updates.deadline.toISOString(),
        updatedAt: expect.any(String)
      });
    });

    describe('PATCH /v1/jobs/:jobId', () => {
      it('should return 403 if user is not recruiter', async () => {
        const job = await prisma.job.create({
          data: {
            title: 'Software Engineer',
            description: 'We are hiring a software engineer',
            location: 'New York',
            employmentType: 'full-time',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            recruiterId: recruiterId
          }
        });

        const updates = {
          title: 'Senior Software Engineer',
          description: 'We are hiring a senior software engineer'
        };

        await request(app)
          .patch(`/v1/jobs/${job.id}`)
          .set('Authorization', `Bearer ${candidateAccessToken}`)
          .send(updates)
          .expect(403);
      });

      it('should return 404 if job is not found', async () => {
        const nonExistentJobId = 999;
        const updates = {
          title: 'Senior Software Engineer'
        };

        await request(app)
          .patch(`/v1/jobs/${nonExistentJobId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updates)
          .expect(404);
      });
    });


   

    describe('GET /v1/jobs/:jobId/applications/:applicationId', () => {
      it('should return an application by id', async () => {
        const job = await prisma.job.create({
          data: {
            title: 'Software Engineer',
            description: 'We are hiring a software engineer',
            location: 'New York',
            employmentType: 'full-time',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            recruiterId: recruiterId
          }
        });

       // Create resumes
  const resume1 = await prisma.resume.create({
    data: {
      filename: 'john_doe_resume.pdf',
      candidate: {
        connect: {
          id: candidateId
        }
      }
    }
  });



  // Create applications using resume IDs
  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: candidateId,
      resumeId: resume1.id,
      status: 'pending'
    }
  });


        const res = await request(app)
          .get(`/v1/jobs/${job.id}/applications/${application.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).toEqual({
          id: application.id,
          candidateId: application.candidateId,
          status: application.status,
          createdAt: application.createdAt.toISOString(),
          updatedAt: application.updatedAt.toISOString(),
          candidate: {
            id: candidateId,
            firstName: userOne.firstName,
            lastName: userOne.lastName,
            email: userOne.email
          }
        });
      });

      it('should return 404 if job is not found', async () => {
        const nonExistentJobId = 999;
        const applicationId = 1;

        await request(app)
          .get(`/v1/jobs/${nonExistentJobId}/applications/${applicationId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });
  });
});
