const jwt = require("jsonwebtoken");
const secret = "abd$123yutwwe";

function setUser(user) {
  return jwt.sign(
    { id: user.id, username: user.usename, email: user.email },
    secret
  );
}
function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = { setUser, getUser };
