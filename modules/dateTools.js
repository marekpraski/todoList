const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

exports.day = ()=> {let day = new Date();
    return dayName[day.getDay()]};

exports.date = ()=> {let day = new Date();
    return day};