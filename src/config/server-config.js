const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({path: envPath})


module.exports={
    PORT: process.env.PORT,
    FLIGHT_SEARCH_SERVICE: process.env.FLIGHT_SEARCH_SERVICE
}