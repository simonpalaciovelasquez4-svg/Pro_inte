import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pool from '../config/database.js'
import { seedData } from './seed-data.js'
import { entities } from '../models/entities.model.js'

try {
  const schemaUrl = new URL('./schema.sql', import.meta.url)
  const schema = await readFile(fileURLToPath(schemaUrl), 'utf8')
  for (const statement of schema.split(';').map(part => part.trim()).filter(Boolean)) {
    await pool.query(statement)
  }

  for (const entity of Object.keys(entities)) {
    const fields = entities[entity]
    const rows = seedData[entity]
    const columns = ['id', ...fields, 'createdAt', 'updatedAt']
    const sql = `INSERT IGNORE INTO \`${entity}\` (${columns.map(column => `\`${column}\``).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`
    for (const row of rows) {
      const now = new Date()
      await pool.execute(sql, [row.id, ...fields.map(field => row[field] ?? ''), now, now])
    }
  }

  console.log('Esquema creado y datos de demostración insertados (si estaban ausentes).')
} finally {
  await pool.end()
}
