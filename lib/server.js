var http = require('http')
var binary = require('binaryjs')
var BinaryStream = binary.BinaryStream
var BinaryServer = binary.BinaryServer

function createServer(options) {
  var server = http.createServer()
  var bs = BinaryServer({ server: server })

  bs.on('connection', function (client) {
    client.on('stream', function (stream, meta) {
      var peer = findPeer(bs, client)
      if (!peer) {
        return stream.write({ errorCode: 1})
      }

      var file = peer.createStream(meta)
      stream.pipe(file)

      stream.on('data', function (data) {
        stream.write({ rx: data.length / meta.size })
      })

      stream.on('end', function () {
        peer.send(file, meta)
      })
    })
  })

  server.listen(options.port)
  console.log('PeerFile server started on port ' + options.port)
}

function findPeer(bs, client) {
  for (var id in bs.clients) {
    if (bs.clients.hasOwnProperty(id)) {
      var otherClient = bs.clients[id]
      if (otherClient !== client) {
        return otherClient
      }
    }
  }
}

exports.create = createServer
