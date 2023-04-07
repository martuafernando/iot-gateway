const UserEntry = require('./UserEntry')
const Logger = require('./Log')
const Student = require('./Student')

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
    const isStudent = await Student.isExisting(idCard.toString())
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
        return true
      } else {
        Logger.logGatewayAction({ idGateway: this.id, idCard: categorizedIdCard, success: false, message: 'Failed to enter the gate: the user is already in' })
        return false
      }
    } else {
      Logger.logGatewayAction({ idGateway: this.id, idCard, success: false, message: 'Failed to enter the gate: User is not registered student' })
      return false
    }
  }

  keluar ({ idCard, isStudent, isInsideGate, categorizedIdCard }) {
    if (isStudent || !this.isOnlyForStudent) {
      if (isInsideGate && this.isExitGateway) {
        UserEntry.delete(idCard.toString())
        Logger.logGatewayAction({ idGateway: this.id, idCard: categorizedIdCard, success: true, message: 'Success to exit the gate' })
        return true
      } else {
        Logger.logGatewayAction({ idGateway: this.id, idCard: categorizedIdCard, success: false, message: 'Failed to enter the gate: the user is already exited' })
        return false
      }
    } else {
      Logger.logGatewayAction({ idGateway: this.id, idCard, success: false, message: 'Failed to enter the gate: User is not registered student' })
      return false
    }
  }
}
