const { createConnection } = require('net')

class Request {
  constructor(
    {
      method = 'GET',
      host,
      port = 80,
      path = '/',
      body = {},
      headers = {},
    } = {}
  ) {
    this.method = method
    this.host = host
    this.port = port
    this.path = path
    this.body = body
    this.headers = headers

    if(!this.headers['Content-Type'])
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'

    if(this.headers['Content-Type'] === 'application/json')
      this.bodyText = JSON.stringify(this.body)
    else if(this.headers['Content-Type'] === 'application/x-www-form-urlencoded')
      this.bodyText = Object.keys(this.body).map(key => `${ key }=${ encodeURIComponent(this.body[key]) }`).join('&')

    this.headers['Content-Length'] = this.bodyText.length
  }

  send = connection => new Promise((resolve, reject) => {
    const parser = new ResponseParser

    if(connection) {
      connection.write(this.toString())
    }else {
      const { host, port, } = this
      connection = createConnection(
        {
          host,
          port,
        },
        () => {
          connection.write(this.toString())
        },
      )
    }

    connection.on('data', data => {
      console.log(data.toString())

      parser.receive(data.toString())

      if(parser.isFinished) {
        resolve(parser.response)
        connection.end()
      }
    })

    connection.on('err', err => {
      reject(err)
      connection.end()
    })
  })

  toString = () => `${ this.method } ${ this.path } HTTP/1.1\r
${ Object.keys(this.headers).map(key => `${ key }: ${ this.headers[key] }`).join('\r\n') }\r
\r
${ this.bodyText }`
}

class ResponseParser {
  constructor() {
  }

  receive = str => {
    const { length } = str

    for(let i = 0; i < length; i++) {
      this.receiveChar(str.charAt(i))
    }
  }

  receiveChar = char => {

  }
}

void async function() {
  const request = new Request({
    method: 'GET',
    host: '127.0.0.1',
    port: '3000',
    path: '/',
    headers: {
      'C-Foo': 'customer',
    },
    body: {
      name: 'ctx',
    },
  })

  const response = await request.send()
}()