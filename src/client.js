const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')

client.on('connect', function () {
  client.subscribe('gTkyy9LWTRiRm7Erxn5YWPGjHxG3ySVjTxPXV6p3kUz57ZLuLY34CkWceA5qhkxnAVQUqez3ixx5TEv7SAm2QAfURu8wyHxvue8n')
  client.publish('X3ZKeVcLzT3QxLumypkf33jMSWHAUF7f83f5quhNy6yV8G4jVRJPjuxMZzHGcrQRSyUPjV7CBmFmwvTHqP2zf4n3Uz2fGBRUC8QS', 'testing')
  client.publish('X3ZKeVcLzT3QxLumypkf33jMSWHAUF7f83f5quhNy6yV8G4jVRJPjuxMZzHGcrQRSyUPjV7CBmFmwvTHqP2zf4n3Uz2fGBRUC8QS', 'adsfasf')
})

client.on('message', function (topic, message) {
  try {
    console.log(message.toString())
  } catch (error) {
    console.log(error)
  }
})
