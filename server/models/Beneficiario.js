import mongoose from 'mongoose'

const beneficiarioSchema = new mongoose.Schema(
  {
    smName: { type: String, required: true, trim: true },
    smSector: { type: String, required: true, trim: true },
    smSeccion: { type: String, required: true, trim: true },
    smFraccion: { type: String, required: true, trim: true },
    nombreCompleto: { type: String, required: true, trim: true, uppercase: true },
    postalCode: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    colonia: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  {
    collection: 'beneficiarios',
    timestamps: true,
  }
)

const Beneficiario = mongoose.model('Beneficiario', beneficiarioSchema)

export default Beneficiario
