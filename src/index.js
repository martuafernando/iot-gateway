const mqtt = require('mqtt')
const GatewayEntry = require('./model/GatewayEntry')
const Logger = require('./model/Log')
const Student = require('./model/Student')
const GatewayConfig = require('./config/gatewayConfig')
const client = mqtt.connect('mqtt://broker.hivemq.com')

try {
  Logger.logProgramAction({ success: true, message: 'Server Started' })
  GatewayEntry.create()
  Student.create()
} catch (error) {
  Logger.logFatalError(error)
  process.exit()
}

client.on('connect', function () {
  Logger.logProgramAction({ success: true, message: 'Connected to MQTT broker' })
  client.subscribe('X3ZKeVcLzT3QxLumypkf33jMSWHAUF7f83f5quhNy6yV8G4jVRJPjuxMZzHGcrQRSyUPjV7CBmFmwvTHqP2zf4n3Uz2fGBRUC8QS')
})

client.on('message', async function (topic, idCard) {
  try {
    const isStudent = await Student.isExisting(idCard.toString())
    const isinsideGate = await GatewayEntry.isExisting(idCard.toString())
    const categorizedIdCard = isStudent ? 'ITS:' + idCard.toString() : 'UMUM:' + idCard.toString()

    if (isStudent || !GatewayConfig.OnlyForStudent) {
      if (GatewayConfig.isOneWayGateway) {
        // Untuk gerbang masuk aja
        if (!isinsideGate) {
          GatewayEntry.insert(idCard.toString())
          client.publish('gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n', 'true')
          Logger.logUserAction({ idCard: categorizedIdCard, success: true, message: 'Success to enter the gate' })
        } else {
          client.publish('gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n', 'true')
          Logger.logUserAction({ idCard: categorizedIdCard, success: false, message: 'Failed to enter the gate: the user is already in' })
        }
      } else {
        if (!isinsideGate) {
          GatewayEntry.insert(idCard.toString())
          client.publish('gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n', 'true')
          Logger.logUserAction({ idCard: categorizedIdCard, success: true, message: 'Success to enter the gate' })
        } else {
          GatewayEntry.delete(idCard.toString())
          client.publish('gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n', 'true')
          Logger.logUserAction({ idCard: categorizedIdCard, success: false, message: 'Success to exit the gate' })
        }
      }
    } else {
      client.publish('gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n', 'false')
      Logger.logUserAction({ idCard, success: false, message: 'Failed to enter the gate: User is not registered student' })
    }
  } catch (error) {
    Logger.logFatalError(error)
  }
})

client.on('error', (error) => {
  Logger.logProgramAction({ success: false, message: error })
})

client.on('close', () => {
  Logger.logProgramAction({ success: true, message: 'Connection to MQTT broker closed' })
})

client.on('offline', () => {
  Logger.logProgramAction({ success: false, message: 'Client offline' })
})

client.on('reconnect', () => {
  Logger.logProgramAction({ success: true, message: 'Attempting to reconnect to MQTT broker' })
})

client.on('end', () => {
  Logger.logProgramAction({ success: true, message: 'Connection to MQTT broker ended' })
})
