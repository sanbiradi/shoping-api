function validatePassword(password) {
  // Check if password length is at least 8 characters
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  // Check if password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  // Check if password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  // Check if password contains at least one digit
  if (!/\d/.test(password)) {
    return "Password must contain at least one digit";
  }

  // If all conditions are satisfied, return true
  return true;
}

module.exports = { validatePassword };
