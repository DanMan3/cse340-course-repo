import db from './db.js';
import bcrypt from 'bcrypt';

const findUserByEmail = async (email) => {
  const query = `
    SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows.length === 0 ? null : result.rows[0];
};

const getAllUsers = async () => {
  const query = `
    SELECT u.user_id, u.name, u.email, r.role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.name
  `;
  const result = await db.query(query);
  return result.rows;
};

const verifyPassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return null;
  const safeUser = { ...user };
  delete safeUser.password_hash;
  return safeUser;
};

const createUser = async (name, email, passwordHash) => {
  const query = `
    INSERT INTO users (name, email, password_hash, role_id)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id;
  `;
  const params = [name, email, passwordHash, 1];
  const result = await db.query(query, params);
  if (result.rows.length === 0) throw new Error('Failed to create user');
  return result.rows[0].user_id;
};

export { findUserByEmail, getAllUsers, verifyPassword, authenticateUser, createUser };