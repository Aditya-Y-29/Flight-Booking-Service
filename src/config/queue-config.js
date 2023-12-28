const amqplib=require('amqplib')

let channel,connection
const queue='Notification-Queue'

async function connectQueue(){
    try {
        connection = await amqplib.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue(queue);
    } catch (error) {
        console.log(error)
        throw error
    }
}

async function sendData(data){
    try {
        await channel.sendToQueue(queue,Buffer.from(JSON.stringify(data)))      
    } catch (error) {
        console.log(error)
        throw error
    }
}

module.exports={
    connectQueue,
    sendData
}