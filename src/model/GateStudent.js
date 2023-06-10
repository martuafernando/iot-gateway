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

module.exports = class GateStudent {
  static async isIdGateValid (idGate) {
    const pool = await sql.connect(poolConfig)
    const query = 'SELECT COUNT(*) AS COUNT FROM register_gate WHERE id_register_gate=@idGate'
    const result = await pool
      .request()
      .input('idGate', sql.VarChar, idGate)
      .query(query)
    sql.close()
    if (result.recordset?.[0]?.COUNT) return true
    return false
  }

  static async isIdCardValid (idCard) {
    const pool = await sql.connect(poolConfig)
    const query = 'SELECT COUNT(*) AS COUNT FROM kartu_akses WHERE id_kartu_akses=@idCard AND is_aktif=1'
    const result = await pool
      .request()
      .input('idCard', sql.VarChar, idCard)
      .query(query)
    sql.close()
    if (result.recordset?.[0]?.COUNT) return true
    return false
  }
}
