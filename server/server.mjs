import http from 'http'
import app from './app.mjs'
import dotenv from 'dotenv'
import models from './models/index.mjs'

dotenv.config()

const server = http.createServer(app)


server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})