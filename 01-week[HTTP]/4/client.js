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
    this.WAITING_STATUS_LINE = 0
    this.WAITING_STATUS_LINE_END = 1
    this.WAITING_HEADER_NAME = 2
    this.WAITING_HEADER_SPACE = 3
    this.WAITING_HEADER_VALUE = 4
    this.WAITING_HEADER_LINE_END = 5
    this.WAITING_HEADER_BLOCK_END = 6
    this.WAITING_BODY = 7

    this.current = this.WAITING_STATUS_LINE
    this.statusLine = ''
    this.headers = {}
    this.headerName = ''
    this.headerValue = ''
    this.bodyParser = null
  }

  receive = str => {
    const { length } = str

    for(let i = 0; i < length; i++) {
      this.receiveChar(str.charAt(i))
    }
  }

  receiveChar = char => {
    switch (this.current) {
      case this.WAITING_STATUS_LINE:
        if(char === '\r')
          this.current = this.WAITING_STATUS_LINE_END
        else
          this.statusLINE += char
        break
      case this.WAITING_STATUS_LINE_END:
        if(char === '\n')
          this.current = this.WAITING_HEADER_NAME
        break
      case this.WAITING_HEADER_NAME:
        if(char === ':')
          this.current = this.WAITING_HEADER_SPACE
        else if(char === '\r')
          this.current = this.WAITING_HEADER_BLOCK_END
        else
          this.headerName += char
        break
      case this.WAITING_HEADER_SPACE:
        if(char === '')
          this.current = this.WAITING_HEADER_VALUE
        break
      case this.WAITING_HEADER_VALUE:
        if(char === '\r') {
          this.current = this.WAITING_HEADER_LINE_END
          this.headers[this.headerName] = this.headerValue
          this.headerName = ''
          this.headerValue = ''
        } else
          this.headerValue += char
        break
      case this.WAITING_HEADER_LINE_END:
        if(char === '\n')
          this.current = this.WAITING_HEADER_NAME
        break
      case this.WAITING_HEADER_BLOCK_END:
        if(char === '\n')
          this.current = this.WAITING_BODY
        break
      case this.WAITING_BODY:
        console.log(char)
        break
    }
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