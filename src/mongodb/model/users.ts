import {BaseContext} from 'koa'
import * as mongoose from 'mongoose'

import {UsersModel, IFriend, IUser} from '../schema/users'

export default class Users {
    public static async updateSocketId(userId: string, socketId: string) {
        UsersModel.findByIdAndUpdate(userId, {$set: {socketId}}, (err: any, userToBeUpdated: any) => {
            // if (err) return handleError(err);
            // userToBeUpdated.socketId = socketId;
            // userToBeUpdated.save(function (err: any) {
            //     // if (err) return handleError(err);
            //     // res.send(tank);
            // });
        })

    }

    public static async addFriend(fromUserId: string, toUserId: string) {
        const toUser: any = await UsersModel.findById(toUserId).exec()
        const fromUser: any = await UsersModel.findById(fromUserId).exec()

        let isExit: boolean = false

        fromUser.friends.some((item: any) => {
            if (String(item.friendId) === String(toUser._id)) {
                isExit = true
                return true
            }
        })

        if (isExit) {

        } else {
            const fromFriend: IFriend = {
                userHeadImg: toUser.userHeadImg,
                unReadNumber: 0,
                userName: toUser.userName,
                _id: toUser._id,
                lastMessage: '',
                friendId: toUser._id,
                lastDate: null,
                lastDateStr: '',
            }
            const toFriend: IFriend = {
                userHeadImg: fromUser.userHeadImg,
                unReadNumber: 0,
                userName: fromUser.userName,
                _id: fromUser._id,
                lastMessage: '',
                lastDate: null,
                lastDateStr: '',
                friendId: fromUser._id,
            }
            fromUser.friends.push(fromFriend)
            toUser.friends.push(toFriend)
            await fromUser.save()
            await toUser.save()
            return {fromFriends: fromUser.friends, toFriends: toUser.friends}
        }


        // const userToBeUpdated: any = await UsersModel.findByIdAndUpdate(fromUserId, {$set: {friends:friends}}).exec()


        // userToBeUpdated.socketId = socketId;
        // const user = await userRepository.update(userToBeUpdated.id, userToBeUpdated);
    }

    public static async getFriends(userId: string) {
        const toUser: any = await UsersModel.findById(userId).exec()
        return toUser.friends?toUser.friends:[]
    }
    public static async seedMessage(fromUserId: string, toUserId: string) {
        const fromUser: any = await UsersModel.findById(fromUserId).exec()

        for (let i = 0; i < fromUser.friends.length; i++) {
            if (String(fromUser.friends[i]._id) === String(toUserId)) {
                fromUser.friends[i].unReadNumber = 0

                fromUser.markModified('friends');
                fromUser.save();
                break;

            }
        }
        return fromUser.friends
    }

    public static async getUserById(userId: string) {
        const toUser: any = await UsersModel.findById(userId).exec()
        return toUser
    }
}
