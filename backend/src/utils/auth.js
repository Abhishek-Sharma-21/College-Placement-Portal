import bcrypt from "bcryptjs";

export const generateHash = async (plainTextPassword) => {
  return await bcrypt.hash(plainTextPassword, 10);
};

export const comparePassword = async (plainTextPassword, hashedPassword) => {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
