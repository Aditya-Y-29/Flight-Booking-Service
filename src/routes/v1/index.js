const express = require('express');
const router=express.Router();
const {infoController}=require('../../controllers');
const bookingRoutes=require('./booking')
router.get('/info',infoController.info)
router.use('/bookings',bookingRoutes)
module.exports=router