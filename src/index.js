const mqtt = require('mqtt')
const User = require('./model/user')
const client = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
  client.subscribe('RUEISYGRUEIGHUSHFGDHFSOGJHSPDFIYHGGGGRUTHUIH')
})

client.on('message', async function (topic, message) {
  try {
    User.create()
    if (await User.isExisting(message.toString())) {
      client.publish('KDJFGIUESRTREGKLDFSK56DR74T98R74YH56DFG4H56GHF4J968I', 'true')
    } else {
      client.publish('KDJFGIUESRTREGKLDFSK56DR74T98R74YH56DFG4H56GHF4J968I', 'false')
    }
  } catch (error) {
    console.log(error)
  }
})
