const errorTypes = require('../../../core/errors');
const { User } = require('../../../models');
const { email, password } = require('../../../models/users-schema');
const { passwordMatched, hashPassword } = require('../../../utils/password');
const bcrypt = require('bcrypt');
/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @param {string} password_confirm - password_confirm
 * @returns {Promise}
 */
async function createUser(name, email, password, password_confirm) {
  return User.create({
    name,
    email,
    password,
    password_confirm,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * mengecek apakah email sudah ada atau belum
 * @param {string} email - email
 * @returns {Promise<boolean>}
 */

async function isEmailTaken(email) {
  const user = await User.findOne({ email: email });
  return user !== null && user !== undefined;
}

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

//membuat change pw
/**
 * @param {string} id - ID Pengguna
 * @param {string} Old_Password - Old_Password
 * @param {string} New_Password - New_Password
 * @param {string} password_confirm - Konfirmasi pasword baru
 * @returns {boolean}
 */
async function changePassword(
  id,
  Old_Password,
  New_Password,
  password_confirm
) {
  const user = await User.findById(id);

  if (!user) {
    throw new errorTypes.USER_NOT_FOUND();
    'USER_NOT_FOUND', 'Empety response, not found';
  }

  //mengecek apakah old pw sama dngn pw hash di db
  const isPasswordMatch = await bcrypt.compare(Old_Password, user.password);

  if (!isPasswordMatch) {
    throw new errorTypes.USER_NOT_FOUND();
    'USER_NOT_FOUND', 'Empety response, not found';
  }

  //hash new pw sebelum di update ke db
  const hashedPassword = await bcrypt.hash(New_Password, 10);
  await updateUser(id, { password: hashedPassword });
  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  isEmailTaken,
  changePassword,
  updatePassword,
};
