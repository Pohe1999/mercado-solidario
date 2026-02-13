import { Router } from 'express'
import SmRegistro from '../models/SmRegistro.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const registros = await SmRegistro.find(
      {},
      {
        SM: 1,
        sm: 1,
        sector: 1,
        seccion: 1,
        Sector: 1,
        Seccion: 1,
        SECTOR: 1,
        SECCION: 1,
        FRACCION: 1,
        fraccion: 1,
      }
    ).lean()

    const data = registros
      .map((registro) => {
        const sm = registro.SM ?? registro.sm ?? registro.Sm ?? ''
        const sector = registro.sector ?? registro.Sector ?? registro.SECTOR ?? ''
        const seccion = registro.seccion ?? registro.Seccion ?? registro.SECCION ?? ''
        const fraccion = registro.fraccion ?? registro.FRACCION ?? ''

        return {
          id: registro._id,
          sm,
          sector,
          seccion,
          fraccion,
        }
      })
      .filter((item) => item.sm)

    return res.json(data)
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo cargar el listado de SM.' })
  }
})

export default router
