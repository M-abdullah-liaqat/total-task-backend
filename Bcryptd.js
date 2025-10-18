const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hashPassword(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    return hashedPassword;
  } catch (error) {
    console.error(error);
  }
}


async function comparePassword(plainPassword, storedHash) {
  try {
    const match = await bcrypt.compare(plainPassword, storedHash);
    if (match) {
      return true; // Passwords match
    } else {
        return false
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = { hashPassword, comparePassword };
