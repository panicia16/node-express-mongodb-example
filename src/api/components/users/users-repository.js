const { User } = require('../../../models');
const { email } = require('../../../models/users-schema');

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

//membuat change pw
/**
 * @param {string} id - ID Pengguna
 * @param {string} OldP_assword - Old_Password
 * @param {string} New_Password - New_Password
 * @returns {boolean}
 */

async function changePassword(userId, Old_Password, New_Password) {
  const user = await usersRepository.getUser(id);

  if (!user) {
    throw new ErrorTypes.USER_NOT_FOUND(
      'USER_NOT_FOUND',
      'Empty response, not found'
    );
  }

  const passwordMatch = await passwordMatched(Old_Password, user.password);

  if (!passwordMatch) {
    throw new ErrorTypes.INVALID_PASSWORD(
      'INVALID_PASSWORD',
      'Invalid password'
    );
  }
  const hashedPassword = await hashPassword(New_Password);
  await usersRepository.updateUser(userId, { password: hashPassword });

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
};
