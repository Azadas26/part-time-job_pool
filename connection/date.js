var promise = require('promise')

module.exports=
{
    date_Between_StartAnd_End : (startDate,endDate,checkDate)=>
    {
        return new promise((resolve,reject)=>
        {
            function isDateBetween(checkDate, startDate, endDate) {
                // Convert string dates to Date objects
                checkDate = new Date(checkDate);
                startDate = new Date(startDate);
                endDate = new Date(endDate);
                // Check if checkDate is between startDate and endDate
                return checkDate >= startDate && checkDate <= endDate;
            }
            
            const today = new Date();
            if (isDateBetween(checkDate, startDate, endDate)) {
               resolve(true)
               console.log(true);
            } else if (today > new Date(endDate)) {
               reject(true)
               console.log("notrue");
            } else {
                console.log("notrue");
               reject(false)
            }
        })
    }
}



