import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import prisma from '../../src/client';
import { Prisma, Role } from '@prisma/client';

const password = 'password123';
const salt = bcrypt.genSaltSync(8);

export const userOne = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: Role.CANDIDATE,
  isEmailVerified: false
};

export const userTwo = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: Role.RECRUITER,
  isEmailVerified: false
};

export const admin = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: Role.ADMIN,
  isEmailVerified: false
};

export const insertUsers = async (users: Prisma.UserCreateManyInput[]) => {
  await prisma.user.createMany({
    data: users.map((user) => ({ ...user, password: bcrypt.hashSync(user.password, salt) }))
  });
};
