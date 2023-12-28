const {BookingService}=require('../services')
const {StatusCodes}=require('http-status-codes')
const {SuccessResponse,ErrorResponse}= require('../utils/common');

const inMemDb={}


async function createBooking(req,res){
    try {
        const booking = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        }) 
        SuccessResponse.data=booking;
        return res
                .status(StatusCodes.CREATED).
                json(SuccessResponse)
    } catch (error) {
        console.log(error)
        ErrorResponse.error=error;
        return res
                .status(error.statusCode).
                json(ErrorResponse)
    }
}

async function makePayement(req,res){
    try {
        const idempotencyKey=req.headers['x-idempotency-key']
        if(!idempotencyKey){
            return res
                .status(StatusCodes.BAD_REQUEST).
                json({message: "Idempotency key not found"})
        }
        if(inMemDb[idempotencyKey]){
            return res
                .status(StatusCodes.BAD_REQUEST).
                json({message: "Cannt retry on successful payement"})
        }
        const payement = await BookingService.makePayement({
            userId: req.body.userId,
            totalCost: req.body.totalCost,
            bookingId: req.body.bookingId
        }) 
        inMemDb[idempotencyKey]=idempotencyKey
        SuccessResponse.data=payement;
        return res
                .status(StatusCodes.CREATED).
                json(SuccessResponse)
    } catch (error) {
        console.log(error)
        ErrorResponse.error=error;
        return res
                .status(error.statusCode).
                json(ErrorResponse)
    }
}

module.exports={
    createBooking,
    makePayement
}