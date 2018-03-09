var mongoModels = require('../mongoModels/index')();
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var validator = require("email-validator");


var User = mongoModels.user();
var Token = mongoModels.token();

module.exports = () => {

  var result = {};

 result.registration = (req, res) => {
    console.log("Inside registration");
   // console.log("Requested Body : " , req.body)

        if ((typeof req.body.name == undefined) || req.body.name == "") {

            res.json({success: false, message: "name not defined"})

        } else if (validator.validate(req.body.email) == false) {

            res.json({success: false, message: "enter correct email format"})

        } else if ((typeof req.body.address == undefined) || req.body.address == "") {

            res.json({success: false, message: "Address not defined"})

        } else if ((typeof req.body.city == undefined) || req.body.city == "") {

            res.json({success: false, message: "City not defined"})

        } else if ((typeof req.body.country == undefined) || req.body.country == "") {

            res.json({success: false, message: "Country not defined"})

        } else if ((typeof req.body.zip_code == undefined) || req.body.zip_code == "") {

            res.json({success: false, message: "Zip code not defined"})

        } else if ((typeof req.body.phone == undefined) || req.body.phone == "") {

            res.json({success: false, message: "Phone Number not defined"})

        } else if ((typeof req.body.password == undefined) || req.body.password == "") {

            res.json({success: false, message: "password not defined"})

        } else {
          //console.log(" Body Data : ", req.body)

          User.findOne({email: req.body.email}).exec((err, userInfo) =>  {

            //console.log("userInfo : ", userInfo);
            //console.log("Error" , err)

              if (userInfo) {
                  res.json({success: false, message: "Email already exists."})
              }
              else {
                //console.log("errrrrrrrr",err)
               var hashedPassword = passwordHash.generate(req.body.password);

                  var user = new User({

                      name: req.body.name,
                      email: req.body.email,
                      address: req.body.address,
                      city: req.body.city,
                      country:req.body.country,
                      zip_code:req.body.zip_code,
                      phone:req.body.phone,
                      password: hashedPassword,

                  });
                  console.log(user)
                  //save user information in dbs
                  user.save((err, userResult) => {
                     // console.log("userResult : " , userResult);
                      if (userResult) {
                          res.json({success: true, message: "User Registration Successfully."});
                      }
                      else {
                         res.json({success: false, message: "Error in Saving User Registration"});
                      }
                  }) //save
              }

          })//findone

        }//else
  }//registration

 // here this api call when user registration is complited after that
 // you can send mail to user for conformation.and after that to set the password.
 result.setPassword = (req, res) => {

    console.log(" Inside setPassword");
    console.log("Requested body: " ,req.body)

    if (req.body.id == undefined || req.body.id == "") {

          res.json({success: false, message: "please send id"});

      } else if(req.body.password == undefined || req.body.password == ""){

          res.json({success: false, message: "please send Password"})

      } else {

          User.findOne({ "_id": req.body.id }, (err, userInfo) => {

              //console.log(userInfo);
              //console.log(err);
              if (userInfo) {

                    var password = passwordHash.generate(req.body.password);

                    User.update({ "_id": req.body.id }, { $set: { password: password } }, (err, updatePassword) => {

                        //console.log(updatePassword)
                       if(updatePassword){

                          res.json({ success: true, msg: "Save password Successfully..." })

                       } else {

                           res.json({ success: false, msg: "Issue In Saving Password..." })
                        }

                    }) // user update

              } else {

                  res.json({ success: false, message: 'user not found' });
              }

          }) // findOne

       }

  }//setPassword

 result.login = (req, res) => {

    console.log("Inside login");
    //console.log("req.body : " ,req.body)

       if (validator.validate(req.body.email) == false) {

            res.json({success: false, message: "enter correct email"})

        } else if(req.body.password == undefined || req.body.password == ""){

          res.json({message: "please enter password"})

      } else {

        User.findOne({email: req.body.email}).exec((err, userInfo) =>  {

        //if email is found in database
        if (userInfo) {

         // check if password matches
          if (!passwordHash.verify(req.body.password, userInfo.password)) {

            res.json({ success: false, message: 'Wrong password.' });

          } else {
                // if user is found and password is correct
                // create a token
                console.log("Successfully Login")

                var createdtoken = jwt.sign(userInfo.toJSON(), 'My secret', {
                      expiresIn: 60 // expires in
                   });
                //console.log(createdtoken);

                var obj = new Token({
                          userId :userInfo.id,
                          token:createdtoken
                      })

                    obj.save((err,userToken) => {

                        if (userToken) {

                            res.json({ success: true,
                                       name: userInfo.name,
                                       email:userInfo.email,
                                       token: userToken.token
                                     });
                            //here also to update user information means to store token
                            //of successfully login user.
                         } else {

                             res.json({success: false, message: 'Error to to Save Tokan Object.'});

                            }
                      })//obj.save
              }//else
       } else {
              res.json({success: false, message: 'Email Not Found...'});
            }
      })//find One
    }
  }//login

  result.getUserInfo = (req,res) => {

        console.log("In getUserInfo")

        //console.log("req.query :", req)
        //console.log(req.query.userId)
        //var id = req.query.userId;
    User.findOne({_id:req.body.id}).exec((err,userResult) => {

      if(err==null){
            var obj={
                     name:userResult.name,
                     email:userResult.email
                   }
                res.json({success:true, data:obj});
          }
       else{
             res.json({success: false, message: err});
          }
    })
  }


result.editUser = (req,res) => {
    //here only edit name and password
    console.log("Inside editUser");
    //console.log("Requested Body : ", req.body);

    if (req.body.email == undefined ||  req.body.email == "") {

            console.log("plese enter email...");
            res.json({message: "enter email..."})
        }

     else{

           User.findOne({email:req.body.email}).exec((err,userResult) => {

            if(userResult!=null){

                User.update({_id:userResult._id},{$set:{

                      name:req.body.name,
                      email:req.body.email,
                      password:passwordHash.generate(req.body.password)

                   }}).exec((err,updatedInfo) => {

                      if(err==null){
                            res.json({success:true,message:"updated successfully...."});
                        }
                       else{
                            res.json({success:false,message:"not updated "+err});
                        }
                   })
              }
            else{
                 res.json({success:false,message:"Enter correct email "});
              }
          })//findone
        }//else
  }//edit user

  result.deleteUser = (req,res) => {

    console.log("Inside deleteUser");
     console.log("Request Body : " ,req.body);
      //var id = req.query.userId;

      if (req.body.id == undefined || req.body.id == ""){

          res.json({message: "Please Enter User Id"})

      } else {

        User.findOne({_id:req.body.id}).exec((err, userInfo) =>  {

          //if email is found in database
          if (userInfo) {

                User.remove({"_id":req.body.id}).exec((err,userResult) => {

                   if(userResult){

                         res.json({success:true, message:"User deleted successfully..."});
                       }
                    else{

                         res.json({success:false, message:"Error in user deleted..Requested User Not Found "});
                       }

                  })
           } else {

              res.json({success:false, message:"User Not Found"});
           }

        })//findOne

      }//else

    }//deleteUser


result.isAuthenticateToken = (req, res, next) => {
     console.log("Inside isAuthenticateToken");

    //console.log("req.headers"+json.stringify(req.session-token));

  var token = req.headers['x-access-token'] || req.body.token || req.query.token || req.session-token;

     if (token) {

         Token.findOne({token: token}).exec((err, results) => {
             // console.log(results)
           if (results) {
                   res.json({success: true, message: "user authenticated"})
            } else {
                  res.json({success: false, message: "Not valid session"})
               }
         });
    } else {
          res.json({success: false, message: "No token passed"})
     }
 } //isAuthenticateToken

 result.logout = function (req, res) {
        console.log("Inside logout");

        //console.log("Requesed Body : ", req.body )
        //console.log("session : " ,  req.session-token);
        //var tokan = req.session.token
        var token = req.body.token;
        console.log("Token : ", token);

        //var token = req.headers['x-access-token'] || req.session-token || req.body.token || req.query.token ;

       var str = token.toString();
             console.log("@@ String : ", str)
             console.log("@@ Token ", token);

        Token.remove({token:token}).exec(function(err,tokenResult){

            //console.log("## tokenResult : " ,tokenResult);
            //console.log("## err : " ,err);

            if(tokenResult){
                res.json({success:true,message:"token removed successfully..."});


            }else{
                res.json({success:false,message:"Issue in removing token..."});
            }

        })

    }//logout


	return result;
}