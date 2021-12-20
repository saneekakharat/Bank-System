var mongoose                = require("mongoose"),
    admin                   = require('./models/admin'),
    data = [
        
    ]

function seedDB(){
    // Remove existing data
    admin.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("Removed Database")
    });
    // Add admin and sample data
    data.forEach(function(seed){
        admin.create(seed, function(err, data){
            if(err){
                console.log(err);
            }else{
                console.log("Added admin and sample data");
            }
        })
    })
}

module.exports = seedDB;