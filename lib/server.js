var fs = require('fs')
var http = require('http')
var BinaryServer = require('binaryjs').BinaryServer

function createServer(options) {
  var server = http.createServer()
  var bs = BinaryServer({ server: server })

  bs.on('connection', function (client) {
    client.on('stream', function (stream, meta) {
      var file = fs.createWriteStream(__dirname+ '/public/' + meta.name)
      stream.pipe(file)

      // Send progress back
      stream.on('data', function (data) {
        stream.write({rx: data.length / meta.size})
      })
    })
  })

  server.listen(options.port)
  console.log('PeerFile server started on port ' + options.port)
}

exports.create = createServer
