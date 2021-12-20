var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    fs                      = require("fs"),
    multer                  = require("multer")

    var el = document.querySelectorAll("#myBtn");
for(var i=0; i < el.length; i++){
    el[i].addEventListener('click', function () {
      console.log(mongoose.Schema.Types.Boolean.convertToTrue);
    }, false);
}