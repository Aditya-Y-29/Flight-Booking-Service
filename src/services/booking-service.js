const axios=require('axios')
const {StatusCodes}=require('http-status-codes')

const {BookingRepository}=require('../repositores')
const {ServerConfig, Queue}=require('../config')
const db=require('../models')
const AppError=require('../utils/errors/app-error')

const {Enums}=require('../utils/common')
const {BOOKED,CANCELLED}=Enums.BOOKING_STATUS

const bookingRepository=new BookingRepository()

async function createBooking(data){
    const transaction = await db.sequelize.transaction();
    try {
        const flight=await axios.get(`${ServerConfig.FLIGHT_SEARCH_SERVICE}/api/v1/flights/${data.flightId}`)
            const flightData=flight.data.data
            if(data.noOfSeats>flightData.totalSeats){
                throw new AppError('Not enough seats available',StatusCodes.BAD_REQUEST)
            }
            const totalBillingAmount= data.noOfSeats*flightData.price;
            bookingPayload={...data,totalCost: totalBillingAmount}
            const booking= await bookingRepository.create(bookingPayload,transaction);
            await axios.patch(`${ServerConfig.FLIGHT_SEARCH_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
                seats: data.noOfSeats
            })
        await transaction.commit()
        return booking
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function makePayement(data){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails=await bookingRepository.get(data.bookingId,transaction)
        if(bookingDetails.status == CANCELLED) {
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
        }
        const bookingTime=new Date(bookingDetails.createdAt)
        const currentTime=new Date()
        if(currentTime-bookingTime>300000){
            await cancelBooking(data.bookingId)
            throw new AppError(`Booking has expired`,StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.totalCost!=data.totalCost){
            throw new AppError(`Cost of booking doesn't match`,StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.userId!=data.userId){
            throw new AppError(`User id of booking doesn't match`,StatusCodes.BAD_REQUEST)
        }
        await bookingRepository.update(data.bookingId,{status: BOOKED},transaction)
        Queue.sendData({
            recepientEmail: 'forpc2089@gmail.com',
            subject: 'Flight Booked!!',
            text: `Your flight booked with flight having id: ${data.bookingId}`
        })
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function cancelBooking(bookingId){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails=await bookingRepository.get(bookingId,transaction)
        if (bookingDetails.status==CANCELLED){
            await transaction.commit()
            return true
        }
        await axios.patch(`${ServerConfig.FLIGHT_SEARCH_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`, {
            seats: bookingDetails.noOfSeats,
            dec: 0
        })
        await bookingRepository.update(bookingId,{status: CANCELLED},transaction)
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function cancelOldBookings(){
    try {
        const timestamp=new Date(Date.now()-1000*300)
        const response= await bookingRepository.cancelOldBookings(timestamp)
        return response
    } catch (error) {
        console.log(error)
        throw error       
    }
}

module.exports={
    createBooking,
    makePayement,
    cancelOldBookings
}