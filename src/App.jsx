import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import codigosPostales from './lista-de-cp-2.json'

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || ''
  const [smOptions, setSmOptions] = useState([])
  const [smQuery, setSmQuery] = useState('')
  const [selectedSm, setSelectedSm] = useState(null)
  const [showSmResults, setShowSmResults] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [postalCode, setPostalCode] = useState('')
  const [cpStatus, setCpStatus] = useState('idle')
  const [locationData, setLocationData] = useState(null)
  const [colonia, setColonia] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      smName: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      postalCode: '',
      colonia: '',
      address: '',
      phone: '',
    },
    mode: 'onBlur',
  })

  const isPostalValid = postalCode.length === 5 && cpStatus === 'success'
  const phoneValue = watch('phone')
  const addressValue = watch('address')
  const isPhoneValid = phoneValue?.replace(/\D/g, '').length === 10
  const isAddressValid = addressValue?.trim().length >= 8

  const colonies = useMemo(() => {
    if (!locationData) return []
    // Copomex devuelve colonias en locationData._colonias si existe
    if (locationData._colonias && Array.isArray(locationData._colonias)) {
      return locationData._colonias
    }
    // Fallback para estructura anterior
    if (locationData.places?.length) {
      const unique = new Set(locationData.places.map((place) => place['place name']))
      return Array.from(unique)
    }
    return []
  }, [locationData])

  const filteredSmOptions = useMemo(() => {
    if (!smQuery.trim()) return smOptions
    const normalized = smQuery.trim().toLowerCase()
    return smOptions.filter((option) => {
      const sm = String(option.sm ?? '').toLowerCase()
      const sector = String(option.sector ?? '').toLowerCase()
      const seccion = String(option.seccion ?? '').toLowerCase()
      return sm.includes(normalized) || sector.includes(normalized) || seccion.includes(normalized)
    })
  }, [smOptions, smQuery])

  useEffect(() => {
    let isActive = true

    const fetchSm = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/sm`)
        if (!response.ok) throw new Error('Error al cargar SM')
        const data = await response.json()
        if (!isActive) return
        setSmOptions(data)
      } catch (error) {
        if (!isActive) return
        setSmOptions([])
      }
    }

    fetchSm()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (postalCode.length !== 5) {
      setLocationData(null)
      setCpStatus('idle')
      setColonia('')
      setValue('colonia', '')
      return
    }

    let isActive = true

    const fetchPostal = async () => {
      setCpStatus('loading')
      try {
        // Buscar en JSON local
        const cpNumber = parseInt(postalCode, 10)
        const results = codigosPostales.filter(item => item['codigo-postal'] === cpNumber)
        
        if (!isActive) return
        
        // Validar respuesta
        if (results.length === 0) {
          throw new Error('CP no encontrado')
        }
        
        const firstResult = results[0]
        // Obtener colonias únicas
        const colonias = [...new Set(results.map(item => item.colonia))]
        
        const mappedData = {
          places: [{
            state: firstResult.Estado || '',
            'place name': firstResult.Municipio || '',
            tipo: firstResult.tipo || ''
          }],
          _colonias: colonias
        }
        
        setLocationData(mappedData)
        setCpStatus('success')
        const firstColonia = colonias[0] || ''
        setColonia(firstColonia)
        setValue('colonia', firstColonia)
      } catch (error) {
        if (!isActive) return
        setLocationData(null)
        setCpStatus('error')
        setColonia('')
        setValue('colonia', '')
      }
    }

    fetchPostal()

    return () => {
      isActive = false
    }
  }, [postalCode])

  const onSubmit = async (formData) => {
    try {
      const nombre = formData.nombre.trim().toUpperCase()
      const apellidoPaterno = formData.apellidoPaterno.trim().toUpperCase()
      const apellidoMaterno = formData.apellidoMaterno.trim().toUpperCase()
      const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`
      
      const payload = {
        smName: formData.smName,
        smSector: String(selectedSm?.sector ?? ''),
        smSeccion: String(selectedSm?.seccion ?? ''),
        smFraccion: String(selectedSm?.fraccion ?? ''),
        nombreCompleto,
        postalCode: formData.postalCode,
        municipio: locationData?.places?.[0]?.['place name'] ?? '',
        colonia: formData.colonia,
        address: formData.address,
        phone: formData.phone,
      }

      const response = await fetch(`${apiBaseUrl}/api/beneficiarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('No se pudo guardar el beneficiario')
      }

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        window.location.reload()
      }, 1800)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-graphite-50 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:gap-8">
        <header className="rounded-2xl border border-[#E9C4D1] bg-white p-5 shadow-card sm:p-6">
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">
            Mercado Solidario
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-[#8B1538] sm:text-3xl">
            Formulario de entrega institucional
          </h1>
          <p className="mt-2 text-sm text-graphite-500 sm:text-[0.95rem]">
            Completa los campos correctamente para una captura válida.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 sm:gap-8">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="order-1 rounded-2xl border border-[#E9C4D1] bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">SM</h2>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-[#8B1538]">
                Buscar SM
              </label>
              <div className="mt-2">
                <input
                  type="hidden"
                  {...register('smName', { required: 'Selecciona un SM' })}
                />
                <div className="relative">
                  <input
                    value={smQuery}
                    onChange={(event) => {
                      const next = event.target.value
                      setSmQuery(next)
                      if (!next.trim()) {
                        setSelectedSm(null)
                      }
                      setValue('smName', next, { shouldValidate: true })
                      setShowSmResults(true)
                    }}
                    onFocus={() => {
                      if (!selectedSm) {
                        setShowSmResults(true)
                      }
                    }}
                    placeholder="Escribe el nombre del SM"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-graphite-800 outline-none transition focus:ring-2 ${
                      selectedSm
                        ? 'border-emerald-500 bg-emerald-50/40 focus:border-emerald-500 focus:ring-emerald-200'
                        : 'border-graphite-200 bg-graphite-50 focus:border-[#8B1538] focus:ring-[#E9C4D1]'
                    }`}
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-graphite-300">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        selectedSm ? 'bg-emerald-500' : 'bg-graphite-300'
                      }`}
                    />
                  </div>

                  {showSmResults && !selectedSm && smQuery.trim().length >= 2 && (
                    <div className="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-graphite-100 bg-white py-2 text-sm shadow-lg">
                      {filteredSmOptions.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-graphite-400">
                          No hay coincidencias
                        </div>
                      ) : (
                        filteredSmOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSelectedSm(option)
                              setSmQuery(option.sm)
                              setValue('smName', option.sm ?? '', { shouldValidate: true })
                              setShowSmResults(false)
                            }}
                            className="flex w-full flex-col gap-1 border-b border-graphite-100 px-4 py-3 text-left transition hover:bg-[#FFF5F7] last:border-b-0"
                          >
                            <span className="font-medium text-graphite-900">{option.sm}</span>
                            {(option.sector || option.seccion) && (
                              <span className="text-xs text-graphite-500">
                                Sector {option.sector || '-'} · Sección {option.seccion || '-'}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-graphite-500">
                Listado desde la colección de registros.
              </p>
              {(selectedSm?.sector || selectedSm?.seccion) && (
                <div className="mt-2 rounded-lg border border-[#E9C4D1] bg-[#FFF5F7] px-3 py-2 text-xs text-graphite-700">
                  <span className="font-semibold text-[#8B1538]">SP:</span>{' '}
                  {selectedSm?.sector || '-'}
                  <span className="mx-2 text-graphite-300">|</span>
                  <span className="font-semibold text-[#8B1538]">SECCION:</span>{' '}
                  {selectedSm?.seccion || '-'}
                </div>
              )}
              {errors.smName && (
                <p className="mt-1 text-xs font-medium text-[#B42318]">{errors.smName.message}</p>
              )}
            </div>
          </section>

          <aside className="order-2 rounded-2xl border border-[#E9C4D1] bg-white/80 p-4 sm:p-5 lg:order-none">
            <ul className="flex flex-col gap-2 text-xs text-graphite-700">
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPostalValid ? 'bg-emerald-500' : 'bg-graphite-300'
                  }`}
                />
                CP válido y localizado
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPhoneValid ? 'bg-emerald-500' : 'bg-graphite-300'
                  }`}
                />
                Teléfono
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isAddressValid ? 'bg-emerald-500' : 'bg-graphite-300'
                  }`}
                />
                Dirección completa
              </li>
            </ul>
          </aside>
          </div>

          <section className="rounded-2xl border border-[#E9C4D1] bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-[#8B1538] sm:text-xl">
              Datos del beneficiario
            </h2>
            <span className="text-xs font-medium">Campos obligatorios</span>
          </div>

          <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-graphite-700 sm:text-sm">Nombre(s)</label>
              <input
                {...register('nombre', {
                  required: 'Requerido',
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
                    message: 'Solo letras',
                  },
                  minLength: {
                    value: 2,
                    message: 'Mínimo 2 caracteres',
                  },
                  onChange: (e) => {
                    const trimmed = e.target.value.replace(/\s+$/, '')
                    setValue('nombre', trimmed)
                  },
                })}
                placeholder="Nombre(s)"
                className="mt-1.5 w-full rounded-lg border border-graphite-200 bg-graphite-50 px-3 py-2 text-sm text-graphite-800 outline-none transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#E9C4D1]"
              />
              {errors.nombre && (
                <p className="mt-0.5 text-xs font-medium text-[#B42318]">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-graphite-700 sm:text-sm">Apellido Paterno</label>
              <input
                {...register('apellidoPaterno', {
                  required: 'Requerido',
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
                    message: 'Solo letras',
                  },
                  minLength: {
                    value: 2,
                    message: 'Mínimo 2 caracteres',
                  },
                  onChange: (e) => {
                    const trimmed = e.target.value.replace(/\s+$/, '')
                    setValue('apellidoPaterno', trimmed)
                  },
                })}
                placeholder="Apellido Paterno"
                className="mt-1.5 w-full rounded-lg border border-graphite-200 bg-graphite-50 px-3 py-2 text-sm text-graphite-800 outline-none transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#E9C4D1]"
              />
              {errors.apellidoPaterno && (
                <p className="mt-0.5 text-xs font-medium text-[#B42318]">
                  {errors.apellidoPaterno.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-graphite-700 sm:text-sm">Apellido Materno</label>
              <input
                {...register('apellidoMaterno', {
                  required: 'Requerido',
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
                    message: 'Solo letras',
                  },
                  minLength: {
                    value: 2,
                    message: 'Mínimo 2 caracteres',
                  },
                  onChange: (e) => {
                    const trimmed = e.target.value.replace(/\s+$/, '')
                    setValue('apellidoMaterno', trimmed)
                  },
                })}
                placeholder="Apellido Materno"
                className="mt-1.5 w-full rounded-lg border border-graphite-200 bg-graphite-50 px-3 py-2 text-sm text-graphite-800 outline-none transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#E9C4D1]"
              />
              {errors.apellidoMaterno && (
                <p className="mt-0.5 text-xs font-medium text-[#B42318]">
                  {errors.apellidoMaterno.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-graphite-700">Código postal</label>
              <input
                {...register('postalCode', {
                  required: 'El código postal es obligatorio',
                  pattern: {
                    value: /^\d{5}$/,
                    message: 'Ingresa 5 dígitos',
                  },
                  onChange: (event) => {
                    const nextValue = event.target.value.replace(/\D/g, '').slice(0, 5)
                    setPostalCode(nextValue)
                    setValue('postalCode', nextValue, { shouldValidate: true })
                  },
                })}
                inputMode="numeric"
                placeholder="00000"
                className="mt-2 w-full rounded-xl border border-graphite-200 bg-graphite-50 px-4 py-3 text-sm text-graphite-800 outline-none transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#E9C4D1]"
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs font-medium text-[#B42318]">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-graphite-700">Municipio</label>
              <input
                value={locationData?.places?.[0]?.['place name'] ?? ''}
                readOnly
                placeholder="--"
                className="mt-2 w-full rounded-xl border border-graphite-200 bg-graphite-100 px-4 py-3 text-sm text-graphite-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-graphite-700">Colonia</label>
              <select
                value={colonia}
                {...register('colonia', {
                  required: 'La colonia es obligatoria',
                  onChange: (event) => setColonia(event.target.value),
                })}
                className="mt-2 w-full rounded-xl border border-graphite-200 bg-graphite-50 px-4 py-3 text-sm text-graphite-800 outline-none transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#E9C4D1]"
              >
                <option value="">Selecciona una colonia</option>
                {colonies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.colonia && (
                <p className="mt-1 text-xs font-medium text-[#B42318]">
                  {errors.colonia.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-graphite-700">Dirección</label>
              <input
                {...register('address', {
                  required: 'La dirección es obligatoria',
                  minLength: {
                    value: 8,
                    message: 'Agrega más detalles',
                  },
                })}
                placeholder="Calle, número, referencias"
                className="mt-2 w-full rounded-xl border border-graphite-200 bg-graphite-50 px-4 py-3 text-sm text-graphite-800 outline-none transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#E9C4D1]"
              />
              {errors.address && (
                <p className="mt-1 text-xs font-medium text-[#B42318]">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-graphite-700">Teléfono</label>
              <input
                type="tel"
                {...register('phone', {
                  required: 'El teléfono es obligatorio',
                  validate: (value) =>
                    value.replace(/\D/g, '').length === 10 || 'Deben ser 10 dígitos',
                  onChange: (event) => {
                    const nextValue = event.target.value.replace(/\D/g, '').slice(0, 10)
                    setValue('phone', nextValue, { shouldValidate: true })
                  },
                })}
                placeholder="55 6778 2377"
                className="mt-2 w-full rounded-xl border border-graphite-200 bg-graphite-50 px-4 py-3 text-sm text-graphite-800 outline-none transition focus:border-[#8B1538] focus:ring-2 focus:ring-[#E9C4D1]"
              />
              {errors.phone && (
                <p className="mt-1 text-xs font-medium text-[#B42318]">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#8B1538] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E9C4D1] transition hover:bg-[#73122D] active:scale-[0.99]"
              >
                Guardar beneficiario
              </button>
            </div>
          </div>
          </section>
        </form>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/40 px-6">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
              <span className="absolute h-20 w-20 rounded-full bg-emerald-200/70 animate-ping" />
              <span className="absolute h-16 w-16 rounded-full bg-emerald-100" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
            <h3 className="text-lg font-semibold text-graphite-900">Registro enviado</h3>
            <p className="mt-1 text-sm text-graphite-500">La información se guardó correctamente.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
