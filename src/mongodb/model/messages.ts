import {BaseContext} from 'koa'
import * as mongoose from 'mongoose'

import {MessagesModel} from "../schema/messages";
import * as moment from "../../index";

export default class Messages {
    public static async addMessage(data: any) {
        const lastMessages: Object[] = await MessagesModel.find({
            $or: [{fromId: data.fromId, toId: data.toId}, {
                fromId: data.toId,
                toId: data.fromId
            }]
        }).sort({date: -1}).skip(0).limit(1).exec();

        if (lastMessages.length === 0) {
            data.isShowTime = true
        } else {
            const lastMessage: any = lastMessages[0]
            const lastDate: Date = lastMessage.date
            const nowDate: Date = data.date
            var minutes: number = Math.floor((nowDate.getTime() - lastDate.getTime()) / (60 * 1000))
            if (minutes > 3) {
                data.isShowTime = true
            } else {
                data.isShowTime = false
            }
        }

        const messages = new MessagesModel(data)
        await messages.save()
        return data
    }
}
