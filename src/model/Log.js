const fs = require('fs')
const logFile = fs.createWriteStream('./logs/' + new Date(new Date().setHours(new Date().getHours() + 7)).toISOString().split('T')[0] + '.log', { flags: 'a' })
const logStdout = process.stdout
const util = require('util')

// DEBUG
// INFO
// WARNING/WARN
// ERROR
// CRITICAL/FATAL

class Logger {
  static Log (d) { //
    logFile.write(util.format(d) + '\n')
    logStdout.write(util.format(d) + '\n')
  }

  static format ({ message, type, user }) {
    const date = new Date(new Date().setHours(new Date().getHours() + 7))
    return `${date.toISOString().split('T')[0]} ${date.toISOString().split('T')[1]} - ${type} - ${user} - ${message}`
  }

  static logGatewayAction ({ idGateway, idCard, success, message }) {
    this.Log(this.format({
      user: `${idGateway}::${idCard}`,
      type: success ? 'INFO' : 'WARN',
      message
    }))
  }

  static logProgramAction ({ success, message }) {
    this.Log(this.format({
      user: 'APP',
      type: success ? 'INFO' : 'ERROR',
      message
    }))
  }

  static logFatalError (message) {
    this.Log(this.format({
      user: 'APP',
      type: 'FATAL',
      message
    }))
  }
}

module.exports = Logger
