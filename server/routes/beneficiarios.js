import { Router } from 'express'
import Beneficiario from '../models/Beneficiario.js'

const router = Router()

router.post('/', async (req, res) => {
  const {
    smName,
    smSector,
    smSeccion,
    smFraccion,
    nombreCompleto,
    postalCode,
    state,
    city,
    colonia,
    address,
    phone,
  } = req.body

  if (
    !smName ||
    !smSector ||
    !smSeccion ||
    !smFraccion ||
    !nombreCompleto ||
    !postalCode ||
    !state ||
    !city ||
    !colonia ||
    !address ||
    !phone
  ) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' })
  }

  if (!/^\d{5}$/.test(postalCode)) {
    return res.status(400).json({ message: 'Código postal inválido.' })
  }

  if (phone.replace(/\D/g, '').length !== 10) {
    return res.status(400).json({ message: 'Teléfono inválido.' })
  }

  try {
    const beneficiario = await Beneficiario.create({
      smName,
      smSector,
      smSeccion,
      smFraccion,
      nombreCompleto,
      postalCode,
      state,
      city,
      colonia,
      address,
      phone,
    })

    return res.status(201).json(beneficiario)
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo guardar el beneficiario.' })
  }
})

export default router
