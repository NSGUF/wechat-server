const ip = 'localhost'
const port = 8080
const dbPath = `mongodb://${ip}/wechat-mongoose`
const ipAndPort = `http://${ip}:${port}`
// export const config: any = {
//     ip: ,
//     // ip: '47.103.2.26',
//     port: 8080,
//     dbPath: `mongodb://${this.ip}/wechat-mongoose`,
//     ipAndPort: `http://${this.ip}:'+${this.dbPath}`,
// }

export {
    ip,
    port,
    dbPath,
    ipAndPort,
}
