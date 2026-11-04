import { pool } from "../db/pool.js";
import bcrypt from "bcryptjs";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.password_hash, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = $1`,
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function createUser({ name, email, password, roleName }) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id)
     VALUES ($1,$2,$3,(SELECT id FROM roles WHERE name=$4))
     RETURNING id, name, email`,
    [name, email, hash, roleName]
  );
  return rows[0];
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
