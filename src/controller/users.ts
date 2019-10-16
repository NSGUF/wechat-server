import {BaseContext} from 'koa'
import {validate, ValidationError} from 'class-validator'

import {password, getAjaxResponse, crypt} from "../utils/tools"
import {ErrorType} from "../utils/enums"
import * as config from '../config'


import * as mongoose from 'mongoose'

// const UsersModel = mongoose.model('Users')
import {UsersModel} from '../mongodb/schema/users'

export default class Users {

    public static async getUsers(ctx: BaseContext) {
        const users: Object[] = await UsersModel.find({}).exec();
        ctx.body = getAjaxResponse({data: users});
    }

    public static async searchUser(ctx: BaseContext) {
        const keyword = ctx.request.body.keyword
        const users: Object[] = await UsersModel.find({phoneNumber: keyword}).exec()

        ctx.body = getAjaxResponse({data: users});
    }

    public static async getUserName(ctx: BaseContext) {
        const _id = ctx.request.body._id
        const user: any = await UsersModel.findById(_id).exec()

        ctx.body = getAjaxResponse({data: user.userName});
    }

    public static async getUser(ctx: BaseContext) {
        const user: Object = ctx.session.user
        if (user) {
            ctx.body = getAjaxResponse({
                data: user
            })
        } else {
            ctx.body = getAjaxResponse({
                error: 1,
                msg: '请登陆',
            })
        }
    }

    public static async register(ctx: BaseContext) {
        const opt: any = ctx.request.body
        const userToBeSaved: any = new UsersModel({
            userName: ctx.request.body.userName,
            password: ctx.request.body.password,
            phoneNumber: ctx.request.body.phoneNumber,
            salt: password.getSalt(),
            friends: [],
            userHeadImg: config.ipAndPort + '/images/header-img.png',
            status: false,
            socketId: '',
        });

        const newPassword = password.getPasswordFromText(userToBeSaved.phoneNumber, userToBeSaved.password)
        userToBeSaved.password = password.encryptPassword(userToBeSaved.salt, newPassword);

        // const errors: ValidationError[] = await validate(userToBeSaved); // errors is an array of validation errors

        /*if (errors.length > 0) {
          // return BAD REQUEST status code and errors array
          ctx.status = 400;
          ctx.body = errors;
        } else */
        if (await UsersModel.findOne({phoneNumber: userToBeSaved.phoneNumber}).exec()) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = 200;
            ctx.body = getAjaxResponse({
                error: ErrorType.ERROR,
                msg: '用户名已经被占用'
            });
        } else {
            const user = await userToBeSaved.save();
            // return CREATED status code and updated user
            ctx.status = 200;
            ctx.body = getAjaxResponse({msg: '添加成功'});
        }
    }

    public static async deleteUser(ctx: BaseContext) {
        // find the user by specified id
        const userToRemove: any = await UsersModel.findOne(+ctx.params.id || 0).exec();
        if (!userToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The user you are trying to delete doesn\'t exist in the db';
        } else if (ctx.state.user.id !== userToRemove.id) {
            // check user's token id and user id are the same
            // if not, return a FORBIDDEN status code and error message
            ctx.status = 403;
            ctx.body = 'A user can only be deleted by himself';
        } else {
            // the user is there so can be removed
            await userToRemove.remove();
            // return a NO CONTENT status code
            ctx.status = 204;
        }

    }

    public static async doLogin(ctx: BaseContext) {
        const data = ctx.request.body;
        const user: any = await UsersModel.findOne({phoneNumber: data.phoneNumber})

        if (user) {
            let salt = user.salt
            if (!salt) {
                salt = password.getSalt()
                const newPassword = password.getPasswordFromText(user.phoneNumber, user.password)
                let encryptedPassword = password.encryptPassword(salt, newPassword)
                user.salt = salt
                user.password = encryptedPassword
                await user.save()
                console.log('没有salt，更新密码成功');
            }

            const newPassword = password.getPasswordFromText(data.phoneNumber, data.password)
            let encryptedPassword = password.encryptPassword(salt, newPassword)

            if (user.password !== encryptedPassword) {
                ctx.status = 200
                ctx.body = getAjaxResponse({
                    error: ErrorType.ERROR,
                    msg: '密码输入错误'
                })
            } else {
                ctx.session.user = user
                ctx.cookies.set('sign', crypt.cryptUserId(user.id), {
                    httpOnly: false
                });
                ctx.status = 200;
                ctx.body = getAjaxResponse({
                    data: user,
                    msg: '登录成功'
                });
            }
        } else {
            ctx.body = getAjaxResponse({
                error: 1,
                msg: '该用户名还没有注册，请先注册'
            });
        }
    }

    public static async keepStatus(ctx: BaseContext) {
        const {phoneNumber, password} = ctx.request.body;
        const user: any = await UsersModel.findOne({phoneNumber: phoneNumber})

        if (user&&user.password===password) {
            ctx.session.user = user
            ctx.cookies.set('sign', crypt.cryptUserId(user.id), {
                httpOnly: false
            });
            ctx.status = 200;
            ctx.body = getAjaxResponse({
                data: user,
                msg: '登录成功'
            });
        }
    }
}
