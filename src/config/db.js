import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('DB connected via prisma')
  } catch (err) {
    console.log(`Database connection error ${err}`)
    process.exit(1)
  }
}

const disconnectDb = async () => {
  await prisma.$disconnect()
}

export { prisma, connectDB, disconnectDb }