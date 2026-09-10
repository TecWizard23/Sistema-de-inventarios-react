import prisma from './prisma.js'
import { hashPassword } from './auth.js'

async function seed(){
  try{
    await prisma.category.createMany({ data: [
      { name: 'Herramientas', description: 'Herramientas manuales y eléctricas' },
      { name: 'Eléctricos', description: 'Material eléctrico y accesorios' }
    ] })
  }catch(e){}

  try{
    await prisma.supplier.createMany({ data: [
      { name: 'Proveedor ABC', contactEmail: 'ventas@abc.com' },
      { name: 'Suministros XYZ', contactEmail: 'contacto@xyz.com' }
    ] })
  }catch(e){}

  try{
    await prisma.unit.createMany({ data: [
      { code: 'pc', name: 'pieza' },
      { code: 'm', name: 'metro' }
    ] })
  }catch(e){}

  const cats = await prisma.category.findMany()
  const sups = await prisma.supplier.findMany()
  const units = await prisma.unit.findMany()

  try{
    await prisma.product.createMany({ data: [
      { sku: 'H-001', name: 'Martillo', description: 'Martillo de 16oz', categoryId: cats[0].id, supplierId: sups[0].id, unitId: units[0].id, price: 12.5, minStock: 5 },
      { sku: 'E-101', name: 'Cable 2mm', description: 'Cable eléctrico 2mm', categoryId: cats[1].id, supplierId: sups[1].id, unitId: units[1].id, price: 1.2, minStock: 10 }
    ] })
  }catch(e){}

  // default admin user
  const adminEmail = 'admin@local'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if(!existing){
    const hashed = await hashPassword('admin123')
    await prisma.user.create({ data: { email: adminEmail, password: hashed, role: 'admin' } })
    console.log('Usuario admin creado: admin@local / admin123')
  }

  console.log('Seed completado')
}

seed().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
