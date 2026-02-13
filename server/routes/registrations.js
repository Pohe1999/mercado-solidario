import { Router } from 'express'
import Registration from '../models/Registration.js'

const router = Router()

router.post('/', async (req, res) => {
  const { smName, postalCode, state, city, colonia, address, phone } = req.body

  if (!smName || !postalCode || !state || !city || !colonia || !address || !phone) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' })
  }

  if (!/^\d{5}$/.test(postalCode)) {
    return res.status(400).json({ message: 'Código postal inválido.' })
  }

  if (phone.replace(/\D/g, '').length !== 10) {
    return res.status(400).json({ message: 'Teléfono inválido.' })
  }

  try {
    const registration = await Registration.create({
      smName,
      postalCode,
      state,
      city,
      colonia,
      address,
      phone,
    })

    return res.status(201).json(registration)
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo guardar el registro.' })
  }
})

export default router
