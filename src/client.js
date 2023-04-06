const mqtt = require('mqtt')
const User = require('./model/user')
const client = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
  client.subscribe('KDJFGIUESRTREGKLDFSK56DR74T98R74YH56DFG4H56GHF4J968I')
  client.publish('RUEISYGRUEIGHUSHFGDHFSOGJHSPDFIYHGGGGRUTHUIH', 'testing')
  client.publish('RUEISYGRUEIGHUSHFGDHFSOGJHSPDFIYHGGGGRUTHUIH', 'adsfasf')
})

client.on('message', function (topic, message) {
  try {
    console.log(message.toString())
  } catch (error) {
    console.log(error)
  }
})
