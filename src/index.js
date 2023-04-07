const mqtt = require('mqtt')
const UserEntry = require('./model/UserEntry')
const Logger = require('./model/Log')
const Student = require('./model/Student')
const Gateway = require('./model/Gateway')
const gatewayConfig = require('./config/gatewayConfig')
const client = mqtt.connect('mqtt://broker.hivemq.com')

try {
  Logger.logProgramAction({ success: true, message: 'Server Started' })
  UserEntry.create()
  Student.create()
} catch (error) {
  Logger.logFatalError(error)
  process.exit()
}

const idGateway = []
const buildedGateway = []
gatewayConfig.forEach((config) => idGateway.push(config.id))

client.on('connect', function () {
  Logger.logProgramAction({ success: true, message: 'Connected to MQTT broker' })
  client.subscribe(idGateway)

  idGateway.forEach((id) => {
    const config = gatewayConfig.filter((it) => it.id === id)?.[0]
    buildedGateway.push(
      new Gateway(config)
    )
  })
})

client.on('message', async function (topic, idCard) {
  try {
    const gateway = buildedGateway.filter((it) => it.id === topic)?.[0]
    const result = await gateway.action(idCard) ? 'true' : 'false'
    client.publish(gateway.sendId, result)
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
