const { createServer } = require('http')
const { argv: [, , port = 3000 ] } = process

const app = createServer((req, res) => {
  let body = []

  req
    .on('data', chunk => body.push(chunk))
    .on('end', () => {
      body = Buffer.concat(body).toString()
      console.log(`body: ${ body }`)
      res.writeHead(200, {
        'Content-Type': 'text/html',
      })
      res.end(`Hello World`)
    })
    .on('error', err => console.error(err))
})
app.listen(port)
console.log(`Server running at: http://localhost:${ port }/ `)