const UserEntry = require('./UserEntry')
const Logger = require('./Log')
// const Student = require('./Student')
const GateStudent = require('./GateStudent')
const GateLog = require('./GateLog')

module.exports = class Gateway {
  constructor ({ id, sendId, isOnlyForStudent, isEnterGateway, isExitGateway }) {
    try {
      this.id = id
      this.sendId = sendId
      this.isOnlyForStudent = isOnlyForStudent
      this.isEnterGateway = isEnterGateway
      this.isExitGateway = isExitGateway
    } catch (error) {
      Logger.logFatalError(error)
      process.exit()
    }
  }

  async action (idCard) {
    // const isStudent = await Student.isExisting(idCard.toString())
    const isStudent = await GateStudent.isIdCardValid(idCard.toString())
    const isInsideGate = await UserEntry.isExisting(idCard.toString())
    const categorizedIdCard = isStudent ? 'ITS:' + idCard.toString() : 'UMUM:' + idCard.toString()

    if (isInsideGate) return this.keluar({ idCard, isStudent, isInsideGate, categorizedIdCard })
    if (!isInsideGate) return this.masuk({ idCard, isStudent, isInsideGate, categorizedIdCard })
  }

  masuk ({ idCard, isStudent, isInsideGate, categorizedIdCard }) {
    if (isStudent || !this.isOnlyForStudent) {
      if (!isInsideGate && this.isEnterGateway) {
        UserEntry.insert(idCard.toString())
        Logger.logGatewayAction({ idGateway: this.id, idCard: categorizedIdCard, success: true, message: 'Success to enter the gate' })
        GateLog.masuk(idCard, 1)
        return true
      } else {
        Logger.logGatewayAction({ idGateway: this.id, idCard: categorizedIdCard, success: false, message: 'Failed to enter the gate: the user is already in' })
        GateLog.masuk(idCard, 1)
        return false
      }
    } else {
      Logger.logGatewayAction({ idGateway: this.id, idCard, success: false, message: 'Failed to enter the gate: User is not registered student' })
      GateLog.masuk(idCard, 0)
      return false
    }
  }

  keluar ({ idCard, isStudent, isInsideGate, categorizedIdCard }) {
    if (isStudent || !this.isOnlyForStudent) {
      if (isInsideGate && this.isExitGateway) {
        UserEntry.delete(idCard.toString())
        Logger.logGatewayAction({ idGateway: this.id, idCard: categorizedIdCard, success: true, message: 'Success to exit the gate' })
        GateLog.keluar(idCard, 1)
        return true
      } else {
        Logger.logGatewayAction({ idGateway: this.id, idCard: categorizedIdCard, success: false, message: 'Failed to enter the gate: the user is already exited' })
        GateLog.keluar(idCard, 1)
        return false
      }
    } else {
      Logger.logGatewayAction({ idGateway: this.id, idCard, success: false, message: 'Failed to enter the gate: User is not registered student' })
      GateLog.keluar(idCard, 0)
      return false
    }
  }
}
