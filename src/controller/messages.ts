import {BaseContext} from 'koa'
import {validate, ValidationError} from 'class-validator'

import {password, getAjaxResponse, crypt} from "../utils/tools"
import {ErrorType} from "../utils/enums"


import * as mongoose from 'mongoose'

// const UsersModel = mongoose.model('Users')
import {MessagesModel} from "../mongodb/schema/messages";

export default class Messages {

    public static async getMessagesByTwoId(ctx: BaseContext) {
        const fromUserId = ctx.request.query.fromUserId
        const toUserId = ctx.request.query.toUserId
        const messages: Object[] = await MessagesModel.find({ $or: [ {fromId: fromUserId, toId: toUserId}, {fromId: toUserId, toId: fromUserId} ] }).sort({ date: 1 }).skip(0).exec();
        // const resultMessage = [...messageOne, ...messageTwo]/*.sort((item1: any, item2: any) => {
        //     // return item1.date.getTime() - item2.date.getTime()
        // })


        ctx.body = getAjaxResponse({data: messages});
    }

}
