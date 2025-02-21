import express from 'express'
import cors from 'cors'
import middleware from './middleware/index.mjs'
import routers from './routers/routers.mjs'
import path from "path"
import { fileURLToPath } from 'url'

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
}

app.use(cors(corsOptions))
app.use(express.json())
app.use('/auth', routers.AuthRouters)
app.use('', routers.UtilizatorRouters)

// Use the authentication middleware for protected routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(middleware.middlewareAuth)
app.use(middleware.genericError)

export default app