var express                 = require("express"),
    mongoose                = require("mongoose"),
    Schema                  = mongoose.Schema,
    app                     = express(),
    methodOverride          = require("method-override"),
    bodyParser              = require("body-parser"),
    path                    = require("path"),
    passport                = require("passport"),
    localStrategy           = require("passport-local"),
    passportLocalMongoose   = require('passport-local-mongoose'),
    methodOverride          = require("method-override"),
    gpc                     = require("generate-pincode"),
    User                    = require('./models/user'),
    admin                   = require('./models/admin'),
    seedDB                  = require('./seeds'),
    nodemailer              = require('nodemailer'),
    flash                   = require("connect-flash"),
    moment1                 = require("moment")

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// seedDB();
mongoose.connect('mongodb://localhost:27017/bank_test_v8');

app.locals.moment = require('moment');
app.use("/static", express.static('./static/'));
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/forms"));
app.use(methodOverride("_method"));
app.use(flash());
// Passport configuration
app.use(require("express-session")({
  secret: "Hello!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(admin.authenticate()));
passport.serializeUser(admin.serializeUser());
passport.deserializeUser(admin.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

var num0 = 4096;
var num1 = Math.floor(Math.random() * 10000);
var num2 = Math.floor(Math.random() * 10000);
var num3 = Math.floor(Math.random() * 10000);
var generatePin = gpc(4);

let opts = { 
  upsert: true,
  'new': true, 
  runValidators: true,
  setDefaultsOnInsert: true, 
};

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'thriftybank@gmail.com',
      pass: 'Thrifty0909'
    }
  });

 


// ===========================
// ROUTES
// ===========================

// Landing Page
app.get("/", function(req, res){
    // res.render("landing");
    res.render("landing/landingMain");
});

app.get("/landing", function(req, res){
  res.render("landing/landing");
})


// Apply Now
app.get("/apply", function(req, res){
    res.render("forms/apply")
});

app.post("/apply", function(req, res){
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var date = req.body.date;
    var email = req.body.email;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var pin_code = req.body.pin_code;
    var aadhar = req.body.aadhar;
    var pan = req.body.pan;
    var account_number = req.body.account_number;
    var account_balance = req.body.account_balance;
    var status = req.body.status;
    var phone = req.body.phone;
    var activity = req.body.activity;
    var pin = generatePin;
    var username = req.body.username;
    var newRequest = {first_name: first_name, last_name: last_name, date: date, address: address, city: city, state: state, pin_code: pin_code, phone: phone, aadhar: aadhar, pan: pan, email: email, status: status, activity: activity, account_number: account_number, account_balance: account_balance, username: username}
 
    // admin.create(newRequest, function(err, newlyCreated){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         res.redirect("/upload");
    //     }
    // })
    Users=new admin(newRequest); 
          admin.register(Users, req.body.password, function(err, user) { 
            if (err) { 
              console.log(err); 
            }
              passport.authenticate("local")(req, res, function(){
              var mailOptions = {
                from: 'thriftybank@gmail.com',
                to: req.body.email,
                subject: 'Thrifty Bank Account',
                text: "Hey there " + req.body.first_name + ", Welcome to Thrifty Bank. We hope you had a great experience accessing the all new website. Congratulations for applying for an account in the world's most sincere and tech-friendly bank. Your details are under review, this may take up to 24 hours in a business day. Once the details are checked, our representative will visit you for physical verification."
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              req.flash("success", "Apply form submited successfuly!")
              res.redirect("/landing");
            })
          }); 
        })

// Money Transfer to Thrifty GET
app.get("/moneytransfer/:id", isLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, user){
      if(err){
          console.log(err);
      }else{
          res.render("features/moneytr", {user: user});
      }
  });
});

// Money Transfer to Thrifty PUT
app.put("/moneytransfer/:id", isLoggedIn, function(req, res, next){
  admin.findById(req.params.id, function(err, user){
    if(err){
      console.log(err);
    }else{
      if(user.account_balance>req.body.amount){
        admin.findByIdAndUpdate({_id: req.params.id, amount: {$gt: 0}}, {$inc : {"account_balance": -req.body.amount}}, opts,  
          function(err, user){
          if(err){
              res.redirect("/landing");
          }else{       
            admin.findOneAndUpdate({"unique": req.body.unique}, {$inc : {"account_balance": req.body.amount}}, opts, 
            function(err, user1){
              if(err){
                admin.findById({_id: req.params.id, amount: {$gt: 0}}, {$inc : {"account_balance": req.body.amount}}, opts, 
                function(err, user, next){
                  if(err){
                    console.log(err)
                  }else{
                    next();
                  }
                });
                console.log(err)
              }else{
                var amount = req.body.amount;
                var sender = user.first_name;
                var receiver = user1.first_name;
                var receiver_lastname = user1.last_name;
                var receiver_account_number = user1.account_number;
                var id = user._id;
                var unique = user1.unique;
                var statementRequest = [{amount: amount, sender: sender, receiver: receiver, receiver_account_number: receiver_account_number, id: id, receiver_lastname: receiver_lastname, unique: unique}]
                User.create(statementRequest, function(err, next){
                  if(err){
                    console.log(err)
                  }else{
                    console.log("Done");
                  }
                });
                console.log("Out")
                admin.findById(req.params.id, function(err){
                  console.log(user.first_name)
                  var mailOptions = {
                    from: 'thriftybank@gmail.com',
                    to: user.email,
                    subject: 'Thrifty Bank Account',
                    text: "Hey there " + user.first_name + ", thank you for using Thrifty Bank online portal. Your account has been debited with ₹" + req.body.amount + " and has been credited to " + req.body.receiver + "'s Thrifty Account. Current balance in your account is ₹" + user.account_balance + "."
                  };
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                })

                admin.findOne({"unique": req.body.unique}, function(err){
                  console.log(user1.first_name)
                  var mailOptions = {
                    from: 'thriftybank@gmail.com',
                    to: user1.email,
                    subject: 'Thrifty Bank Account',
                    text: "Hey there " + user1.first_name + ", your account has been credited with ₹" + req.body.amount + " received from " + user.first_name + "'s Thrifty Account. Current balance in your account is ₹" + user1.account_balance + "."
                  };
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                })      
                  req.flash("success", "Money Transfer to " + user1.first_name + " of ₹" + req.body.amount + " was successful. Confirmation mail sent successfully.")
                  res.redirect("/moneytransfer/" + req.params.id);
              }
            });
          }
        }); 
      }else{
        req.flash("error", "Insufficient Balance")
        console.log("Insufficient Balance!");
        res.redirect("/moneytransfer/" + req.params.id);
      }
    }
  })
});

// Money Transfer to Other GET
app.get("/moneytransfer1/:id", isLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, user){
      if(err){
          console.log(err);
      }else{
          res.render("features/moneytr1", {user: user});
      }
  });
});

// Money Transfer to Other PUT
app.put("/moneytransfer1/:id", isLoggedIn, function(req, res, next){
  admin.findById(req.params.id, function(err, user){
    if(err){
      console.log(err);
    }else{
      if(user.account_balance>req.body.amount){
        admin.findByIdAndUpdate({_id: req.params.id, amount: {$gt: 0}}, {$inc : {"account_balance": -req.body.amount}}, opts,  
          function(err, user){
          if(err){
              res.redirect("/landing");
          }else{
            req.flash("success", "Money Transfer was successful. Confirmation mail sent successfully.")
            res.redirect("/moneytransfer1/" + req.params.id);            
          }
        }); 
      }else{
        req.flash("error", "Insufficient Balance")
        console.log("Insufficient Balance");
        res.redirect("/moneytransfer1/" + req.params.id);
      }
    }
  })
});

// Request Money Route GET
app.get("/request/:id", isLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, user){
    if(err){
      console.log(err)
    }else{
      res.render("features/requestMoney")
    }
  })
})

// Request Money Route POST
app.put("/request/:id", isLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, user){
    if(err){
      console.log(err)
    }else{
      var mailOptions = {
        from: 'thriftybank@gmail.com',
        to: req.body.email,
        subject: 'Money Request Thrifty',
        text: "Hey there " + req.body.request_name + ", " + user.first_name + " (TUC: " + user.unique + ") has requested ₹" + req.body.amount + " for the purpose:  '" + req.body.purpose + "'. You can use Thrifty to pay " + user.first_name + " by using the Thrifty Unique Code (TUC)"
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      console.log("Email sent");
      req.flash("success", "Money request was successfully sent via mail.")
      res.redirect("/request/" + req.params.id);
    }
  })
})


app.get("/fd", function(req, res){
  res.render("features/benefits")
});

app.get("/fd/eligibility", function(req, res){
  res.render("features/eligibility")
});

app.get("/fd/documents", function(req, res){
  res.render("features/documents")
});

app.get("/fd/apply", function(req, res){
  res.render("features/apply")
});

// View Account Balance Route
app.get("/viewbalance", isLoggedIn, function(req, res){
    res.render("features/viewBalance");
});

app.get("/viewstatement/:id", isLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, user){
    if(err){
      console.log(err)
    }else{
      User.find({"id": user._id}, function(err, user){
        // var request = [
        //   {
        //   statement_amount: user.amount,
        //   statement_sender: user.sender,
        //   statement_receiver: user.receiver,
        //   statement_receiver_account_number: user.receiver_account_number,
        //   time: moment1(user.createdAt).format('LLLL')
        //   }
        // ]
         
          // var request = {amount: statement_amount, sender: statement_sender, receiver: statement_receiver, number: statement_receiver_account_number, time: time}
          console.log(user);
        res.render("features/viewStatement", {request: user});
      })
    }
  })
})

app.get("/stateadmin/:id", isLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, user){
    if(err){
      console.log(err)
    }else{
      User.find({"id": user._id}, function(err, user){
        res.render("admin/statement", {request: user});
      })
    }
  })
})

app.get("/edloan", function(req, res){
  res.render("features/education")
});

app.get("/hloan", function(req, res){
  res.render("features/homeloan")
});



// ==========================================================================================================
// Admin START
// ==========================================================================================================

// =======================================
// ADMIN LOGIN
// =======================================

app.get("/admin", function(req, res){
    res.render("forms/adminLogin");
});

app.get("/adminlogged", adminLoggedIn, function(req, res){
    // req.flash("success", "Admin successfully logged in")
    res.render("admin/adminlanding");
})


// =======================================
// ALL REQUESTS
// =======================================

// VIEWING
app.get("/adminview", adminLoggedIn, function(req, res){
    admin.find({}, function(err, newUser){
        if(err){
            console.log(err)
        }else{
            res.render("admin/adminview", {newUser: newUser});
        }
    });
});

// VIEW MORE INFO
app.get("/adminview/:id", adminLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, viewUser){
      if(err){
          console.log(err);
      }else{
          res.render("admin/viewUser", {viewUser: viewUser});
      }
  });
});

// ACCEPT USER
app.put("/adminview/:id", adminLoggedIn, function(req, res){
  admin.findByIdAndUpdate(req.params.id, {"status": true, "account_balance": 5000, "pin": generatePin, "account_number":  ""+ num0 + num1 + num2 + num3, "unique": gpc(4)}, function(err, viewUser){
      if(err){
          console.log(err);
      }else{
        admin.findById(req.params.id, function(err, user){
          if(err){
            console.log(err)
          }else{
            var mailOptions = {
              from: 'thriftybank@gmail.com',
              to: user.email,
              subject: 'Thrifty Bank Account',
              text: "Hey there " + user.first_name + ", Welcome to Thrifty Bank, your account request has been accepted. As our new customer ₹5000 has been credited to your account. We have also generated a TUC (Thrifty Unique Code) for hassle free money transfers to other Thrifty Bank users. Your TUC is " + user.unique + "."
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          }
        })
        res.redirect("/adminview");
      }
  })
})

// DELETE USER REQUEST
app.delete("/adminview/:id", adminLoggedIn, function(req, res){
  admin.findByIdAndRemove(req.params.id, function(err, user){
    if(err){
      console.log(err);
    }else{
      var mailOptions = {
        from: 'thriftybank@gmail.com',
        to: user.email,
        subject: 'Thrifty Bank Account',
        text: "Hey there " + user.first_name + ", your request for account creation has been rejected for some reasons. You can apply again or reply to this mail for further information."
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      console.log("Deleted");
      res.redirect("/adminview");
    }
  })
})

// =======================================
// Viewing ACCEPTED USERS
// =======================================

// VIEWING
app.get("/adminview1", adminLoggedIn, function(req, res){
    admin.find({}, function(err, newUser){
        if(err){
            console.log(err)
        }else{
            res.render("admin/adminview1", {newUser: newUser});
        }
    });
});

// VIEW MORE INFO
app.get("/adminview1/:id", adminLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, viewUser){
      if(err){
          console.log(err);
      }else{
          res.render("admin/viewUser1", {viewUser: viewUser});
      }
  });
});

// BLOCK ACCOUNT PUT
app.put("/adminview1/:id", adminLoggedIn, function(req, res){
  admin.findByIdAndUpdate(req.params.id, {"blocked": true}, function(err){
      if(err){
          console.log(err);
      }else{
          res.redirect("/adminview1");
      }
  });
});

// =======================================
// Viewing BLOCKED USERS
// =======================================

// VIEWING
app.get("/adminview2", adminLoggedIn, function(req, res){
  admin.find({}, function(err, newUser){
      if(err){
          console.log(err)
      }else{
          res.render("admin/adminview2", {newUser: newUser});
      }
  });
});

// VIEW MORE INFO
app.get("/adminview2/:id", adminLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, viewUser){
      if(err){
          console.log(err);
      }else{
          res.render("admin/viewUser2", {viewUser: viewUser});
      }
  });
});

// UNBLOCK USER
app.put("/adminview2/:id", adminLoggedIn, function(req, res){
  admin.findByIdAndUpdate(req.params.id, {"blocked": false}, function(err, viewUser){
      if(err){
          console.log(err);
      }else{
              res.redirect("/adminview2");
      }
  })
})

// =======================================
// LOAD BALANCE PAGE
// =======================================

// BALANCE PAGE
app.get("/balance", adminLoggedIn, function(req, res){
  admin.find({}, function(err, newUser){
    if(err){
        console.log(err)
    }else{
        res.render("admin/loadPage", {newUser: newUser});
    }
  });
});

app.get("/balance/:id", adminLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, viewUser){
      if(err){
          console.log(err);
      }else{
          res.render("admin/balanceInfo", {viewUser: viewUser});
      }
  });
});

// LOAD BALANCE PAGE
app.get("/balance/:id/load", adminLoggedIn, function(req, res){
  admin.findById(req.params.id, function(err, viewUser){
      if(err){
          console.log(err);
      }else{
          res.render("admin/balance", {viewUser: viewUser});
      }
  });
});

// LOAD BALANCE PUT
app.put("/balance/:id", adminLoggedIn, function(req, res){
  admin.findByIdAndUpdate(req.params.id, {$inc : {"account_balance": req.body.account_balance}}, function(err, updatedBalance){
      if(err){
          res.redirect("/landing");
      }else{
          res.redirect("/balance/" + req.params.id);
      }
  })
})

// ==========================================================================================================
// Admin END
// ==========================================================================================================



// ==========================================================================================================
// Auth Routes START
// ==========================================================================================================

app.get("/register", function(req, res){
    res.render("forms/register");
});

app.post("/register", function(req, res){
    req.body.username
    req.body.password
    Users=new admin({username: req.body.username, admin_status: true});
    admin.register(Users, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("forms/register")
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/admin");
        })
    })
})

app.get("/login", function(req, res){
    res.render("forms/login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/landing",
    failureRedirect: "/login"
}), function(req, res){
});

app.get("/logout", function(req, res){
  req.logOut();
  req.flash("success", "Logged you out!")
  res.redirect("/landing");
});

app.get("/logoutadmin", function(req, res){
  req.logOut();
  res.redirect("/");
});

app.post("/admin", requiresAdmin, passport.authenticate("local", {
    successRedirect: "/adminlogged",
    failureRedirect: "/admin"
}), function(req, res){
});

app.listen(3000, function(){
    console.log("Banking Server is up and running");
})

// ==========================================================================================================
// Auth Routes END
// ==========================================================================================================



// ==========================================================================================================
// Middleware
// ==========================================================================================================

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logeed in to do that!")
    res.redirect("/login");
}

function isVerfied(req, res, next){
    res.redirect("/register1");
}

function adminLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // req.flash("error", "Admin Login Required!")
    res.redirect("/admin");
}

function requiresAdmin(req, res, next) {
    if (req.body.username === "admin")
          next();
        else
          // req.flash("error", "Admin Login Required!")
          res.redirect("/admin");
          // res.status(401).send('Unauthorised');
    };