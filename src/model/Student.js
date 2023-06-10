const sqlite3 = require('sqlite3').verbose()
const dbFile = './src/database/student.db'

const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
  if (err) throw err
})

module.exports = class Student {
  static create () {
    const sql = `CREATE TABLE IF NOT EXISTS Student(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                IdUser VARCHAR(64) UNIQUE NOT NULL,
                Name VARCHAR(64) NOT NULL
              );`
    db.run(sql, (err, result) => {
      if (err) throw err
    })
  }

  static async insert ({ idCard, name }) {
    const result = await db.run('INSERT INTO Student (IdUser, Name) VALUES (?,?)', [idCard, name])
    return result
  }

  static async get (idCard) {
    const sql = idCard === undefined ? 'SELECT * FROM Student' : 'SELECT * FROM Student WHERE IdUser = (?)'

    return new Promise((resolve, reject) => {
      db.all(sql, [idCard], (err, rows) => {
        if (err) reject(err)

        if (rows?.length > 0) resolve(rows)
        else resolve([])
      })
    })
  }

  static async isExisting (idCard) {
    const sql = 'SELECT IdUser FROM Student WHERE IdUser = (?)'

    return new Promise((resolve, reject) => {
      db.all(sql, [idCard], (err, rows) => {
        if (err) reject(err)

        if (rows?.length > 0) resolve(true)
        else resolve(false)
      })
    })
  }

  static async delete (idCard) {
    const sql = 'DELETE FROM Student WHERE id=?'
    const existingUser = (await this.get(idCard))?.[0]

    return new Promise((resolve, reject) => {
      if (!existingUser) reject(new Error('Data yang akan dihapus tidak ditemukan'))

      const id = existingUser.id
      db.run(sql, [id], (err) => {
        if (!err) resolve('Data deleted')
      })
    })
  }

  static async close () {
    await db.close()
  }
}
