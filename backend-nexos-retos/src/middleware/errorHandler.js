export default function errorHandler(error, _req, res, _next) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'El cuerpo de la solicitud no contiene JSON válido.' } })
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { message: 'Ya existe un registro con ese valor único.' } })
  }
  if (error.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({ error: { message: 'Falta ejecutar npm run db:setup para crear el esquema de la base de datos.' } })
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: { message: 'Una de las entidades relacionadas no existe.' } })
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: { message: 'No se puede eliminar: existen registros relacionados.' } })
  }
  if (['ER_DATA_TOO_LONG', 'ER_TRUNCATED_WRONG_VALUE', 'ER_BAD_NULL_ERROR', 'ER_NO_DEFAULT_FOR_FIELD'].includes(error.code)) {
    return res.status(400).json({ error: { message: 'Uno o más campos no cumplen el formato o la longitud permitidos.' } })
  }

  const status = error.status || 500
  if (status >= 500) console.error(error)
  return res.status(status).json({
    error: { message: status >= 500 ? 'Error interno del servidor.' : error.message },
  })
}
