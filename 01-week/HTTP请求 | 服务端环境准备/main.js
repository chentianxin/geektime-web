const { createServer } = require('http')

const app = createServer((req, res) => {
  let body = []

  req
    .on('data', chunk => {
      body.push(chunk.toString())
    })
    .on('end', () => {
      body = Buffer.concat(body).toString()
      console.log(`body: ${ body }`)
      res.writeHead(200, {
        'Content-Type': 'text/html',
      })
      res.end(`Hello World\n`)
    })

})
app.listen(8080)
console.log('Server Started')