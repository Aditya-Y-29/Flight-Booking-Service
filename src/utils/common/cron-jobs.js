var cron = require('node-cron');
const {BookingService}=require('../../services')
// Running cron after 30 minutes
function scheduleCrons(){
    cron.schedule('*/30 * * * *', async () => {
        await BookingService.cancelOldBookings()
    });

}

module.exports=scheduleCrons
