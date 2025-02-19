import express from 'express'
import cors from 'cors'
import middleware from './middleware/index.mjs'
import routers from './routers/routers.mjs'

const app = express()

const corsOptions = {
    origin: 'http://localhost:5173', // Change this to match your frontend origin
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
}

app.use(cors(corsOptions))
app.use(express.json())
app.use('/auth', routers.UtilizatorRouters)

// Use the authentication middleware for protected routes
app.use(middleware.middlewareAuth)
app.use(middleware.genericError)

export default app