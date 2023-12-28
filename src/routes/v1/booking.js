const express=require('express')
const {BookingController}=require('../../controllers')
const router=express.Router()

router.post('/',BookingController.createBooking)
router.post('/payements',BookingController.makePayement)

module.exports=router