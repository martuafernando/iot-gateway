const db = require('../database/config')

module.exports = class User {
  static create () {
    const sql = `CREATE TABLE IF NOT EXISTS User(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              IdUser VARCHAR(64)
            );`
    db.run(sql, (err, result) => {
      if (err) throw err
      console.log('Table created')
    })
  }

  static async insert (idCard) {
    const result = await db.run('INSERT INTO User (IdUser) VALUES (?)', idCard)
    return result
  }

  static async isExisting (idCard) {
    let result
    const sql = 'SELECT * FROM User'

    db.all(sql, async (err, rows) => {
      if (err) throw err

      if (rows.length > 0) {
        global.result = rows
        console.log(rows)
      } else {
        console.log('tidak ada data/hasil')
      }
    })
    console.log(result)
  }

  static async close () {
    return await db.close()
  }
}
