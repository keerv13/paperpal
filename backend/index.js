const express = require('express')
const cors = require('cors')
require('dotenv/config')
const bodyParser = require('body-parser')
const router = require('./routes/router')
const mongoose = require('mongoose')
console.log("Loaded DB_URI:", process.env.DB_URI);

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use('/', router)

const dbOptions = {useNewUrlParser:true, useUnifiedTopology:true}
mongoose.connect(process.env.DB_URI, dbOptions)
.then(() => console.log('DB Connected!'))
.catch(err => console.error("MongoDB connection error:", err))

const port = process.env.PORT
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})