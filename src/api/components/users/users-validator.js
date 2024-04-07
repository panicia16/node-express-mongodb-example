const joi = require('joi');
const passport_confirm = require('passport');
const changePassword = require('joi');
const isCelebrateError = require('celebrate');
const hashPassword = require('../../../utils/password');
module.exports = {
  createUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joi.string().min(6).max(32).required().label('Password'),
      password_confirm: joi
        .string()
        .min(6)
        .max(32)
        .required()
        .valid(joi.ref('password'))
        .label('Password Confirmation'),
    },
  },

  updateUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
    },
  },

  changePassword: {
    body: {
      Old_Password: joi.string().required(),

      New_Password: joi
        .string()
        .min(6)
        .max(32)
        .required()
        .label('New Password'),
      password_confirm: joi
        .string()
        .min(6)
        .max(32)
        .required()
        .valid(joi.ref('New_Password'))
        .label('Password Confirmation'),
    },
  },
};
