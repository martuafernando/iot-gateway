require('dotenv').config()
const sql = require('mssql')

// Create a MSSQL connection pool
const poolConfig = {
  user: process.env.MSQL_DB_USER,
  password: process.env.MSQL_DB_PASSWORD,
  server: process.env.MSQL_DB_HOST,
  database: process.env.MSQL_DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}
const serverId = '7'
module.exports = class GateLog {
  static getCurrentDate () {
    const date = new Date(new Date().setHours(new Date().getHours() + 7))
    return `${date.toISOString().replace('T', ' ').split('.')[0]}`
  }

  static async cek () {
    const pool = await sql.connect(poolConfig)
    const query = 'SELECT * FROM log_masuk ORDER BY date_time DESC'
    const result = await pool
      .request()
      .query(query)
    sql.close()
    return result
  }

  static async masuk (idCard, isValid) {
    const pool = await sql.connect(poolConfig)
    const query = 'INSERT INTO log_masuk (id_kartu_akses, id_register_gate, date_time, is_valid) VALUES (@idCard, @idGate, @datetime, @isValid)'
    const result = await pool
      .request()
      .input('idCard', sql.VarChar, idCard)
      .input('idGate', sql.VarChar, serverId)
      .input('datetime', sql.VarChar, this.getCurrentDate())
      .input('isValid', sql.Bit, isValid)
      .query(query)
    sql.close()
    return result
  }

  static async keluar ({ idCard, isValid }) {
    const pool = await sql.connect(poolConfig)
    const query = 'INSERT INTO log_keluar (id_kartu_akses, id_register_gate, date_time, is_valid) VALUES (@idCard, @idGate, @datetime, @isValid)'
    const result = await pool
      .request()
      .input('idCard', sql.VarChar, idCard)
      .input('idGate', sql.VarChar, serverId)
      .input('datetime', sql.VarChar, this.getCurrentDate())
      .input('isValid', sql.Int, isValid)
      .query(query)
    sql.close()
    return result
  }
}
