import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { userService } from '../services';
import { User } from '@prisma/client';

const createUser = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, username, role } = req.body;
  const user = await userService.createUser(firstName, lastName, email, password, username, role);
  res.status(httpStatus.CREATED).send(user);
});

const getCurrentUser = catchAsync(async (req, res) => {
  const currentUser = req.user as User;
  const user = await userService.getUserById(currentUser.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const updateCurrentUser = catchAsync(async (req, res) => {
  const currentUser = req.user as User;
  const user = await userService.updateUserById(currentUser.id, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteCurrentUser = catchAsync(async (req, res) => {
  const currentUser = req.user as User;

  await userService.deleteUserById(currentUser.id);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createUser,
  getUsers,
  getUser,
  getCurrentUser,
  updateUser,
  updateCurrentUser,
  deleteUser,
  deleteCurrentUser
};
