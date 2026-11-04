import 'dotenv/config'
import app from './app.js'
import pool from './config/database.js'

const port = Number(process.env.PORT || 3001)
const server = app.listen(port, () => {
  console.log(`Nexo API escuchando en http://localhost:${port}`)
})

async function shutdown() {
  server.close(async error => {
    if (error) {
      console.error(error)
      process.exitCode = 1
    }
    await pool.end()
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
