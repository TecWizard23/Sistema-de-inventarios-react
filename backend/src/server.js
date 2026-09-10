import express from 'express'
import cors from 'cors'
import prisma from './prisma.js'
import { hashPassword, comparePassword, signToken, getUserFromToken, requireRole } from './auth.js'

const app = express()
app.use(cors())
app.use(express.json())

function asyncHandler(fn){
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

async function authMiddleware(req, res, next){
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if(!token) return res.status(401).json({ detail: 'Missing token' })
  const user = await getUserFromToken(token)
  if(!user) return res.status(401).json({ detail: 'Invalid token' })
  req.user = user
  next()
}

function adminOnly(req, res, next){
  if(!requireRole(req.user, ['admin'])) return res.status(403).json({ detail: 'Forbidden' })
  next()
}

function writeGuard(...handlers){
  return [authMiddleware, adminOnly, ...handlers]
}

function parsePaging(query){
  const page = Math.max(parseInt(query.page || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10) || 10, 1), 100)
  const skip = (page - 1) * limit
  const q = (query.q || '').trim()
  return { page, limit, skip, q }
}

function jsonList(items, total, page, limit){
  return { items, total, page, limit }
}

function orderItemData(item){
  return {
    productId: parseInt(item.productId, 10),
    qty: parseInt(item.qty, 10),
    cost: item.cost !== undefined ? parseFloat(item.cost) : undefined,
    price: item.price !== undefined ? parseFloat(item.price) : undefined,
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { email, password, role } = req.body
  if(!email || !password) return res.status(400).json({ detail: 'email and password required' })
  const hashed = await hashPassword(password)
  const user = await prisma.user.create({ data: { email, password: hashed, role: role || 'employee' } })
  res.json({ id: user.id, email: user.email, role: user.role })
}))

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if(!user) return res.status(400).json({ detail: 'Invalid credentials' })
  const ok = await comparePassword(password, user.password)
  if(!ok) return res.status(400).json({ detail: 'Invalid credentials' })
  const token = signToken(user)
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } })
}))

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role })
})

app.get('/api/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { id: 'desc' } })
  res.json(categories)
}))

app.post('/api/categories', ...writeGuard(asyncHandler(async (req, res) => {
  const { name, description } = req.body
  if(!name) return res.status(400).json({ detail: 'name required' })
  const created = await prisma.category.create({ data: { name, description } })
  res.json(created)
})))

app.get('/api/products', asyncHandler(async (req, res) => {
  const { page, limit, skip, q } = parsePaging(req.query)
  const where = q ? { OR: [{ sku: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] } : {}
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { id: 'desc' }, include: { category: true, supplier: true, unit: true } }),
    prisma.product.count({ where })
  ])
  res.json(jsonList(items, total, page, limit))
}))

app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const item = await prisma.product.findUnique({ where: { id }, include: { category: true, supplier: true, unit: true } })
  if(!item) return res.status(404).json({ detail: 'Product not found' })
  res.json(item)
}))

app.post('/api/products', ...writeGuard(asyncHandler(async (req, res) => {
  const { sku, name, description, price = 0, min_stock = 0, category_id, supplier_id, unit_id } = req.body
  if(!sku || !name) return res.status(400).json({ detail: 'SKU and name are required' })
  if(parseFloat(price) < 0) return res.status(400).json({ detail: 'Price must be >= 0' })
  const existing = await prisma.product.findUnique({ where: { sku } })
  if(existing) return res.status(400).json({ detail: 'SKU already exists' })
  const created = await prisma.product.create({ data: { sku, name, description, price: parseFloat(price), minStock: parseInt(min_stock, 10) || 0, categoryId: category_id ? parseInt(category_id, 10) : null, supplierId: supplier_id ? parseInt(supplier_id, 10) : null, unitId: unit_id ? parseInt(unit_id, 10) : null } })
  res.json(created)
})))

app.put('/api/products/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const payload = req.body
  if(payload.price !== undefined && parseFloat(payload.price) < 0) return res.status(400).json({ detail: 'Price must be >= 0' })
  const updated = await prisma.product.update({ where: { id }, data: { name: payload.name, description: payload.description, price: payload.price !== undefined ? parseFloat(payload.price) : undefined, minStock: payload.min_stock !== undefined ? parseInt(payload.min_stock, 10) : undefined, categoryId: payload.category_id !== undefined ? (payload.category_id ? parseInt(payload.category_id, 10) : null) : undefined, supplierId: payload.supplier_id !== undefined ? (payload.supplier_id ? parseInt(payload.supplier_id, 10) : null) : undefined, unitId: payload.unit_id !== undefined ? (payload.unit_id ? parseInt(payload.unit_id, 10) : null) : undefined } })
  res.json(updated)
})))

app.delete('/api/products/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await prisma.product.delete({ where: { id } })
  res.json({ ok: true })
})))

app.get('/api/suppliers', asyncHandler(async (req, res) => {
  const { page, limit, skip, q } = parsePaging(req.query)
  const where = q ? { name: { contains: q, mode: 'insensitive' } } : {}
  const [items, total] = await Promise.all([
    prisma.supplier.findMany({ where, skip, take: limit, orderBy: { id: 'desc' } }),
    prisma.supplier.count({ where })
  ])
  res.json(jsonList(items, total, page, limit))
}))

app.post('/api/suppliers', ...writeGuard(asyncHandler(async (req, res) => {
  const { name, contactEmail, contactPhone, address } = req.body
  if(!name) return res.status(400).json({ detail: 'Name required' })
  res.json(await prisma.supplier.create({ data: { name, contactEmail, contactPhone, address } }))
})))

app.put('/api/suppliers/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  res.json(await prisma.supplier.update({ where: { id }, data: req.body }))
})))

app.delete('/api/suppliers/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await prisma.supplier.delete({ where: { id } })
  res.json({ ok: true })
})))

app.get('/api/customers', asyncHandler(async (req, res) => {
  const { page, limit, skip, q } = parsePaging(req.query)
  const where = q ? { name: { contains: q, mode: 'insensitive' } } : {}
  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { id: 'desc' } }),
    prisma.customer.count({ where })
  ])
  res.json(jsonList(items, total, page, limit))
}))

app.post('/api/customers', ...writeGuard(asyncHandler(async (req, res) => {
  const { name, contactPhone, contactEmail } = req.body
  if(!name) return res.status(400).json({ detail: 'Name required' })
  res.json(await prisma.customer.create({ data: { name, contactPhone, contactEmail } }))
})))

app.put('/api/customers/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  res.json(await prisma.customer.update({ where: { id }, data: req.body }))
})))

app.delete('/api/customers/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await prisma.customer.delete({ where: { id } })
  res.json({ ok: true })
})))

app.get('/api/employees', asyncHandler(async (req, res) => {
  const { page, limit, skip, q } = parsePaging(req.query)
  const where = q ? { OR: [{ firstName: { contains: q, mode: 'insensitive' } }, { lastName: { contains: q, mode: 'insensitive' } }] } : {}
  const [items, total] = await Promise.all([
    prisma.employee.findMany({ where, skip, take: limit, orderBy: { id: 'desc' } }),
    prisma.employee.count({ where })
  ])
  res.json(jsonList(items, total, page, limit))
}))

app.post('/api/employees', ...writeGuard(asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body
  if(!firstName || !lastName) return res.status(400).json({ detail: 'First and last name required' })
  res.json(await prisma.employee.create({ data: { firstName, lastName, email } }))
})))

app.put('/api/employees/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  res.json(await prisma.employee.update({ where: { id }, data: req.body }))
})))

app.delete('/api/employees/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await prisma.employee.delete({ where: { id } })
  res.json({ ok: true })
})))

app.get('/api/purchase-orders', asyncHandler(async (req, res) => {
  const orders = await prisma.purchaseOrder.findMany({ include: { supplier: true, items: true }, orderBy: { id: 'desc' } })
  res.json(orders)
}))

app.post('/api/purchase-orders', ...writeGuard(asyncHandler(async (req, res) => {
  const { supplierId, items = [], status = 'draft' } = req.body
  if(!supplierId) return res.status(400).json({ detail: 'supplierId required' })
  const created = await prisma.purchaseOrder.create({ data: { supplierId: parseInt(supplierId, 10), status, items: { create: items.map(orderItemData) } }, include: { supplier: true, items: true } })
  res.json(created)
})))

app.put('/api/purchase-orders/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const { supplierId, items = [], status } = req.body
  const updated = await prisma.$transaction(async (tx) => {
    await tx.purchaseItem.deleteMany({ where: { purchaseOrderId: id } })
    return tx.purchaseOrder.update({ where: { id }, data: { supplierId: supplierId ? parseInt(supplierId, 10) : undefined, status }, include: { supplier: true, items: true } })
  })
  if(items.length){
    for(const item of items){
      await prisma.purchaseItem.create({ data: { purchaseOrderId: id, ...orderItemData(item) } })
    }
  }
  const finalOrder = await prisma.purchaseOrder.findUnique({ where: { id }, include: { supplier: true, items: true } })
  res.json(finalOrder)
})))

app.delete('/api/purchase-orders/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await prisma.$transaction(async (tx) => {
    await tx.purchaseItem.deleteMany({ where: { purchaseOrderId: id } })
    await tx.purchaseOrder.delete({ where: { id } })
  })
  res.json({ ok: true })
})))

app.get('/api/sale-orders', asyncHandler(async (req, res) => {
  const orders = await prisma.saleOrder.findMany({ include: { customer: true, items: true }, orderBy: { id: 'desc' } })
  res.json(orders)
}))

app.post('/api/sale-orders', ...writeGuard(asyncHandler(async (req, res) => {
  const { customerId, items = [], status = 'open' } = req.body
  const created = await prisma.saleOrder.create({ data: { customerId: customerId ? parseInt(customerId, 10) : null, status, items: { create: items.map(orderItemData) } }, include: { customer: true, items: true } })
  res.json(created)
})))

app.put('/api/sale-orders/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const { customerId, items = [], status } = req.body
  await prisma.$transaction(async (tx) => {
    await tx.saleItem.deleteMany({ where: { saleOrderId: id } })
    await tx.saleOrder.update({ where: { id }, data: { customerId: customerId ? parseInt(customerId, 10) : null, status } })
  })
  for(const item of items){
    await prisma.saleItem.create({ data: { saleOrderId: id, ...orderItemData(item) } })
  }
  const finalOrder = await prisma.saleOrder.findUnique({ where: { id }, include: { customer: true, items: true } })
  res.json(finalOrder)
})))

app.delete('/api/sale-orders/:id', ...writeGuard(asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await prisma.$transaction(async (tx) => {
    await tx.saleItem.deleteMany({ where: { saleOrderId: id } })
    await tx.saleOrder.delete({ where: { id } })
  })
  res.json({ ok: true })
})))

app.get('/api/movements', asyncHandler(async (req, res) => {
  const movements = await prisma.inventoryMovement.findMany({ include: { product: true, location: true }, orderBy: { createdAt: 'desc' } })
  res.json(movements)
}))

app.post('/api/movements', ...writeGuard(asyncHandler(async (req, res) => {
  const { productId, qty, type, locationId } = req.body
  if(!productId || !type) return res.status(400).json({ detail: 'productId and type required' })
  const parsedQty = Math.abs(parseInt(qty, 10) || 0)
  const mv = await prisma.inventoryMovement.create({ data: { productId: parseInt(productId, 10), qty: parsedQty, type, locationId: locationId ? parseInt(locationId, 10) : null } })
  const where = { productId: parseInt(productId, 10), locationId: locationId ? parseInt(locationId, 10) : null }
  let stock = await prisma.stockLevel.findFirst({ where })
  if(!stock){
    stock = await prisma.stockLevel.create({ data: { ...where, qty: 0 } })
  }
  const delta = type.toLowerCase() === 'in' ? parsedQty : type.toLowerCase() === 'out' ? -parsedQty : parsedQty
  await prisma.stockLevel.update({ where: { id: stock.id }, data: { qty: stock.qty + delta } })
  res.json(mv)
})))

app.get('/api/stock-levels', asyncHandler(async (req, res) => {
  const stockLevels = await prisma.stockLevel.findMany({ include: { product: true, location: true }, orderBy: { id: 'desc' } })
  res.json(stockLevels)
}))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ detail: 'Internal server error' })
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
