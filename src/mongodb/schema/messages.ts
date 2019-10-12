import * as mongoose from 'mongoose'
import * as moment from 'moment'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId


const MessagesSchema = new Schema({
    fromId: {type: ObjectId, ref: 'Users'},
    fromUserHeadImg: String,
    toId: {type: ObjectId, ref: 'Users'},
    toUserHeadImg: String,
    message: String,
    date: {type: Date, index: true},
    dateStr: String,
    isShowTime: Boolean,
})


export const MessagesModel = mongoose.model('Messages', MessagesSchema)
