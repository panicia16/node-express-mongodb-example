const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { passwordMatched } = require('../../../utils/password');
const { ErrorTypes } = require('../../../core/errors');
/**
 * mengecek apakah email sudah ada atau belum
 * @param {string} email - email
 * @returns {Promise<boolean>}
 */

async function isEmailTaken(email) {
  return usersRepository.isEmailTaken(email);
}

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} password_confirm - password_confirm
 * @returns {boolean}
 */
async function createUser(name, email, password, password_confirm) {
  //mengecek apakah email sudah ada atau belum
  const isEmailExists = await isEmailTaken(email);
  if (isEmailExists) {
    throw new ErrorTypes.EMAIL_ALREADY_TAKEN(
      'EMAIL_ALREADY_TAKEN',
      'This email already taken, try use another'
    );
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  //memeriksa email yang sedang diperbarui sama atau beda dengan email saat ini
  if (email != user.email) {
    //memeriksa email baru apakah sudah ada atau belum
    const isEmailExists = await isEmailTaken(email);
    if (isEmailExists) {
      throw new ErrorTypes.EMAIL_ALREADY_TAKEN(
        'EMAIL_ALREADY_TAKEN',
        'This email is already taken, try using antoher one'
      );
    }
  }
  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * @param {string} userId - ID Pengguna
 * @param {string} oldPassword - Old Password
 * @param {string} newPassword - New Password
 * @returns {boolean}
 */

async function changePassword(userId, oldPassword, newPassword) {
  const user = await usersRepository.getUser(userId);

  if (!user) {
    throw new ErrorTypes.USER_NOT_FOUND('USER_NOT_FOUND', 'User not found');
  }

  const passwordMatch = await passwordMatched(oldPassword, user.password);

  if (!passwordMatch) {
    throw new ErrorTypes.INVALID_PASSWORD(
      'INVALID_PASSWORD',
      'Old password is incorrect'
    );
  }
  const hashedPassword = await hashPassword(newPassword);
  await usersRepository.updateUser(userId, { password: hashPassword });

  return true;
}
module.exports = {
  isEmailTaken,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
