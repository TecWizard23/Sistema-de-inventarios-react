import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from './prisma.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev_change'

export async function hashPassword(password){
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password, hash){
  return await bcrypt.compare(password, hash)
}

export function signToken(user){
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
}

export function verifyToken(token){
  try{ return jwt.verify(token, JWT_SECRET) }catch(e){ return null }
}

export async function getUserFromToken(token){
  const data = verifyToken(token)
  if(!data) return null
  return prisma.user.findUnique({ where: { id: data.id } })
}

export function requireRole(user, roles = []){
  if(!user) return false
  if(roles.length === 0) return true
  return roles.includes(user.role)
}
