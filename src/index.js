const express =require('express');
const {ServerConfig, Logger, Queue}=require('./config');
const CRON=require('./utils/common/cron-jobs')
const apiRoutes = require('./routes')

const app=express()
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use('/api',apiRoutes)

app.listen(ServerConfig.PORT,async()=>{
    console.log(`successfully started server at ${ServerConfig.PORT}`);
    Logger.info({
        level: 'info',
        message: 'Hello distributed log files!'
    });
    CRON()
    await Queue.connectQueue()
    console.log("Queue Connected")
})