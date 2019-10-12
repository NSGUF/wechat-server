import * as mongoose from 'mongoose'

const Schema = mongoose.Schema

const ObjectId = Schema.Types.ObjectId

export interface IFriend {
    userHeadImg: String,
    unReadNumber: Number,
    userName: String,
    _id: String,
    lastMessage: String,
    lastDate: Date,
    lastDateStr: String,
    friendId: String,
}

export interface IUser {
    _id: String,
    userName: String,
    phoneNumber: String,
    userHeadImg: String,
    password: String,
    salt: String,
    friends: IFriend[],
    status: Boolean,
    socketId: String,
}

const UsersSchema = new Schema({
    userName: String,
    phoneNumber: String,
    userHeadImg: String,
    password: String,
    salt: String,
    friends: [{
        userHeadImg: String,
        unReadNumber: Number,
        userName: String,
        _id: ObjectId,
        friendId: ObjectId,
        lastMessage: String,
        lastDate: Date,
        lastDateStr: String,
    }],
    status: Boolean,
    socketId: String,
})


export const UsersModel = mongoose.model('Users', UsersSchema)
