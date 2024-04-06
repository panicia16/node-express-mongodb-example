const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { hashPassword } = require('../../../utils/password');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    //Memastikan password dan confirm pw tidak kosong
    if (!password || !password_confirm) {
      throw errorResponder(errorTypes.INVALID_PASSWORD, 'Invalid password');
    }

    //memastikan pw dan konfirmasi pw sesuai
    if (password != password_confirm) {
      throw errorResponder(errorTypes.INVALID_PASSWORD, 'Invalid password');
    }
    //memanggil fungi untuk mengecek apakah email sudah ada atau belum
    const emailExists = await usersService.isEmailTaken(email);
    if (emailExists) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'This email already taken, try use another'
      );
    }

    //jika email belum ada, lanjutkan create user
    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }
    // Hash password
    const hashedPassword = await hashPassword(password);

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    //dapatkan pengguna berdasarkan id untuk mengecek apakah sudah ada atau belum
    const user = await usersService.getUser(id);
    if (!user) {
      throw errorResponder(errorTypes.NOT_FOUND, 'User not found');
    }

    //mengecek apakah email yang di update berbeda dan sudah ada
    if (email != user.email) {
      const emailExists = await usersService.isEmailTaken(email);
      if (emailExists) {
        throw errorResponder(
          errorTypes.EMAIL_ALREADY_TAKEN,
          'EMAIL_ALREADY_TAKEN',
          'This email is already taken, try using another one'
        );
      }
    }

    //update the user
    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(request, response, next) {
  try {
    const userId = request.params.id;
    const { oldPassword, newPassword } = request.body;

    const success = await usersService.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    if (!success) {
      errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response
      .status(200)
      .json({ message: 'Password changed successfully' });
  } catch (error) {
    return next(error);
  }
}
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
