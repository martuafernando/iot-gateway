const mqtt = require('mqtt')
const User = require('./model/user')
// const client = mqtt.connect('mqtt://test.mosquitto.org')

// client.on('connect', function () {
//   client.subscribe('presence', function (err) {
//     if (!err) {
//       console.log(User)
//       client.publish('presence', 'Hello mqttwe')
//     }
//   })
// })

// client.on('message', function (topic, message) {
//   console.log(message.toString())
//   client.end()
// })

User.create()
User.isExisting('testing')
