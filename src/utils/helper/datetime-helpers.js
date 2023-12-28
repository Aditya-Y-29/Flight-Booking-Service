function compareDates(dateString1, dateString2) {
    var date1 = new Date(dateString1);
    var date2 = new Date(dateString2);   
    console.log(date1)
    console.log(date2) 
    return date1>=date2;
}

module.exports={
    compareDates
}
