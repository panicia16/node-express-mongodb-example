const joi = require('joi');
const passport_confirm = require('passport');

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
      oldPassword: joi.string().required.label('Old Password'),
      newPassword: joi.string().min(6).max(32).required().label('New Password'),
      password_confirm: joi
        .string()
        .min(6)
        .max(32)
        .required()
        .valid(joi.ref('newPassword'))
        .label('Password Confirmation'),
    },
  },
};
