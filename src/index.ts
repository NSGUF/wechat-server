import * as Koa from "koa";
import * as Router from "koa-router";
import * as KoaStatic from 'koa-static'
import * as bodyParser from "koa-bodyparser";
import * as KoaCors from 'koa2-cors'

const path = require('path')
const session = require("koa-session2");
import {AppRoutes} from "./routes";
import {tools} from "./controller"
import * as KoaLogger from 'koa-logger'
import * as KoaHelmet from 'koa-helmet'
import {getAjaxResponse, crypt} from "./utils/tools"
import * as config   from './config'

require('./mongodb/index')
import {IFriend} from "./mongodb/schema/users";

import * as model from './mongodb/model/index'
import {UsersModel} from "./mongodb/schema/users";
import * as moment from "moment";
import {MessagesModel} from "./mongodb/schema/messages";

const app = new Koa();
const router: any = new Router();

app.use(KoaCors());

app.use(KoaLogger((str, args) => {
    // redirect koa logger to other output pipe
    // default is process.stdout(by console.log function)
    // console.log(str)
    // console.log(args)

    // fs.appendFile('./src/logs/logs.txt',`${str}\n`,function (error) {
    //   if(error){
    //     console.log(error)
    //   }else{
    //     console.log('异步写入ok')
    //   }
    // })
}))
app.use(KoaHelmet())
router.all('/*', tools.defense);

app.use(KoaStatic(
    path.join(__dirname, `./static`)
))

// register all application routes
AppRoutes.forEach(route => router[route.method](route.path, route.action));

// run app
app.use(session({
    key: "SESSIONID",   //default "koa:sess"
}));

// 未登录拦截
// app.use(async (ctx, next) => {
//     const whiteArr = ['/captcha', '/login', '/register', '/users']
//     if (ctx.session.user) {// 如果登录了
//         var sign = ctx.cookies.get('sign');
//         var correctSign = crypt.cryptUserId(ctx.session.user._id);
//         if (correctSign !== sign) {// 如果登录的
//             ctx.body = getAjaxResponse({
//                 error: 2,
//                 msg: '验证有误'
//             })
//         } else {
//             await next()
//         }
//     } else if (whiteArr.indexOf(ctx.request.path) > -1) {
//         await next()
//     } else {
//         ctx.body = getAjaxResponse({
//             error: 2,
//             msg: '请先登陆'
//         })
//     }
// })

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = require("http").createServer(app.callback());
const io = require("socket.io")(server);

io.on("connection", (socket: any) => {
    const socketId = socket.id;

    //登录
    socket.on("login", async (userId: string) => {
        await model.user.updateSocketId(userId, socketId)
        // await model.socketModel.updateSocketId(userId, socketId)//socketModel.saveUserSocketId(userId, socketId);
    });

    socket.on("addFriend", async (fromUserId: string, toUserId: string) => {
        const data = await model.user.addFriend(fromUserId, toUserId)
        if (data) {
            const {fromFriends, toFriends} = data

            const toUser: any = await model.user.getUserById(toUserId)

            io.to(socketId).emit("refreshFriends", fromFriends);
            io.to(toUser.socketId).emit("refreshFriends", toFriends);
        } else {
            console.log('对方已经是好友')
        }
    });
    socket.on("getFriends", async (userId: string) => {
        const friends = await model.user.getFriends(userId)
        io.to(socketId).emit("refreshFriends", friends);
    });

    socket.on('sendPrivateMsg', async (fromId: string, toId: string, message: string) => {
        const fromUser: any = await model.user.getUserById(fromId)
        const toUser: any = await model.user.getUserById(toId)

        const lastDate = new Date()
        const lastDateStr = moment(lastDate).format('YYYY-MM-DD HH:mm')

        for (let i = 0; i < fromUser.friends.length; i++) {
            if (String(fromUser.friends[i]._id) === String(toUser._id)) {
                fromUser.friends[i].lastDate = lastDate
                fromUser.friends[i].lastDateStr = lastDateStr
                fromUser.friends[i].lastMessage = message

                fromUser.markModified('friends');
                fromUser.save();
                break;

            }
        }
        for (let i = 0; i < toUser.friends.length; i++) {
            if (String(toUser.friends[i]._id) === String(fromUser._id)) {
                toUser.friends[i].lastDate = lastDate
                toUser.friends[i].lastDateStr = lastDateStr
                toUser.friends[i].lastMessage = message
                toUser.friends[i].unReadNumber = Number(toUser.friends[i].unReadNumber) + 1
                toUser.markModified('friends');
                toUser.save();
                break;
            }
        }


        const data: any = {
            fromId,
            fromUserHeadImg: fromUser.userHeadImg,
            toId,
            toUserHeadImg: toUser.userHeadImg,
            message,
            date: lastDate,
            dateStr: lastDateStr,
        }
        let fromSocketId = fromUser.socketId
        let toSocketId = toUser.socketId

        const result: any = await model.messages.addMessage(data)

        io.to(fromSocketId).emit('newMsg', result)
        io.to(toSocketId).emit('refreshFriends', toUser.friends)
        io.to(toSocketId).emit('newMsg', result)
    })

    // 用户告诉服务器 消息被看过了
    socket.on("seed", async (fromId: string, toId: string) => {
        const friends = await model.user.seedMessage(fromId, toId)
        io.to(socketId).emit("refreshFriends", friends);
    });
    // //私聊
    // socket.on("sendPrivateMsg", async (data : any)=> {
    //     const arr = await socketModel.getUserSocketId(data.to_user);
    //     const RowDataPacket = arr[0];
    //     const socketid = JSON.parse(JSON.stringify(RowDataPacket)).socketid;
    //     io.to(socketid).emit("getPrivateMsg", data);
    // });
    //
    // socket.on('receive', function (msg, from, to) {
    //     console.log(msg, from, to)
    //     let date = new Date().toTimeString().substr(0, 8)
    //     let socketId = user[to]
    //     let meSocketId = user[from]
    //     io.sockets.sockets[meSocketId].emit('newMsg', {from: from, to: to, msg: msg, date: date})
    //     if (socketId) {
    //         io.sockets.sockets[socketId].emit('newMsg', {from: from, to: to, msg: msg, date: date})
    //     }
    //     DBModule.NewsList.addNews({from: from, to: to, msg: msg, date: date})
    // })

    socket.on("disconnect", (data: any) => {
        console.log("disconnect", data);
    });
});

server.listen(config.port);

console.log("Koa application is up and running on port " + config.port);


