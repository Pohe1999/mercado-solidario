import mongoose from 'mongoose'

const smRegistroSchema = new mongoose.Schema(
  {
    SM: { type: String },
    sm: { type: String },
    sector: { type: String },
    seccion: { type: String },
    Sector: { type: String },
    Seccion: { type: String },
  },
  {
    collection: 'registros',
    timestamps: false,
    strict: false,
  }
)

const SmRegistro = mongoose.model('SmRegistro', smRegistroSchema)

export default SmRegistro
