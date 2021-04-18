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

  send = () => new Promise((resolve, reject) => {

  })
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