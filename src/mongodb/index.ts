import * as mongoose from 'mongoose'
import * as config  from '../config'
import * as fs from 'fs'
import { resolve } from 'path'
require('./schema/users')
require('./schema/messages')

// const models = resolve(__dirname, './schema')
//
// fs.readdirSync(models)
//     .forEach(file => require(resolve(models, file)))

const database = () => {
    mongoose.set('debug', true)

    mongoose.connect(config.dbPath)
    console.log(config.dbPath)

    mongoose.connection.on('disconnected', () => {
        mongoose.connect(config.dbPath)
    })
    mongoose.connection.on('error', err => {
        console.error(err)
    })

    mongoose.connection.on('open', async () => {
        console.log('Connected to MongoDB ', config.dbPath)
    })
}

database()
