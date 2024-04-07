const usersRepository = require('./users-repository');
const errorTypes = require('../../../core/errors');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { User } = require('../../../models');

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
    throw new errorTypes.EMAIL_ALREADY_TAKEN(
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
      throw new errorTypes.EMAIL_ALREADY_TAKEN(
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

//CHANGE PW

/**
 * @param {string} id - ID Pengguna
 * @param {string} Old_Password - Old_Password
 * @param {string} New_Password - New_Password
 * @param {string} password_confirm - Konfirmasi pasword baru
 * @returns {boolean}
 */

//UPDATE PASSWORD
//membuat fungsi updatePassword utk mengubah pw pengguna
/**
 * Update password for a user
 * @param {string} id - User Id
 * @param {string} New_Password - New Password
 * @returns {Promise<boolean>}
 */

async function updatePassword(id, New_Password) {
  try {
    const user = await User.findByIdAndUpdate(id, { password: New_Password });
    if (!user) {
      throw new Error('User not found');
    }
    return true;
  } catch (error) {
    //menghandle error jika terjadi kesalahan dalam mengubah pw
    console.error('Error updating password', error);
    return false;
  }
}

async function changePassword(
  id,
  Old_Password,
  New_Password,
  password_confirm
) {
  const user = await usersRepository.getUser(id);

  if (!user) {
    throw new errorTypes.USER_NOT_FOUND(
      'USER_NOT_FOUND',
      'Empty response, not found'
    );
  }

  const isPasswordMatch = await passwordMatched(Old_Password, user.password);
  if (!isPasswordMatch) {
    throw new errorTypes.INVALID_PASSWORD(
      'INVALID_PASSWORD_ERROR',
      'The old password entered is incorrect. Please try again.'
    );
  }

  //memastikan pw baru dan konfirmasi pw sesuai
  if (New_Password !== password_confirm) {
    throw new errorTypes.INVALID_PASSWORD(
      'INVALID_PASSWORD_ERROR',
      'The old password entered is incorrect. Please try again.'
    );
  }

  const hashedPassword = await hashPassword(New_Password);
  await usersRepository.updatePassword(id, { password: hashedPassword });

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
  updatePassword,
};
