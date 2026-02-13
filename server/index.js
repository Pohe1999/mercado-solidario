import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import registrationsRouter from './routes/registrations.js'
import smRouter from './routes/sm.js'
import beneficiariosRouter from './routes/beneficiarios.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/registrations', registrationsRouter)
app.use('/api/sm', smRouter)
app.use('/api/beneficiarios', beneficiariosRouter)

const { MONGODB_URI, PORT = 4000 } = process.env

if (!MONGODB_URI) {
  console.error('Falta MONGODB_URI en el entorno.')
  process.exit(1)
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor listo en puerto ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error.message)
    process.exit(1)
  })
