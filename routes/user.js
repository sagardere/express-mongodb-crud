var mongoModels = require('../mongoModels/index')();
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var validator = require("email-validator");

var User = mongoModels.user();

module.exports = () => {
  var result = {};

  result.registration = (req, res) => {
    console.log("Inside registration");

    if (validator.validate(req.body.email) == false) {
      res.json({
        success: false,
        message: "enter correct email format"
      })
    } else if ((typeof req.body.password == undefined) || req.body.password == "") {
      res.json({
        success: false,
        message: "password not defined"
      })
    } else {

      User.findOne({
        email: req.body.email
      }).exec((err, userInfo) => {
        if (userInfo) {
          res.json({
            success: false,
            message: "Email already exists."
          })
        } else {
          var hashedPassword = passwordHash.generate(req.body.password);
          var user = new User({
            email: req.body.email,
            password: hashedPassword
          });

          //save user information in dbs
          user.save((err, userResult) => {
            if (userResult) {
              res.json({
                success: true,
                message: "User Registration Successfully."
              });
            } else {
              res.json({
                success: false,
                message: "Error in Saving User Registration"
              });
            }
          });
        }
      });
    }
  }

  result.login = (req, res) => {
    console.log("Inside login");

    if (validator.validate(req.body.email) == false) {
      res.json({
        success: false,
        message: "enter correct email"
      });
    } else if (req.body.password == undefined || req.body.password == "") {
      res.json({
        message: "please enter password"
      });
    } else {
      User.findOne({
        email: req.body.email
      }).exec((err, userInfo) => {
        //if email is found in database
        if (userInfo) {
          // check if password matches
          if (!passwordHash.verify(req.body.password, userInfo.password)) {
            res.json({
              success: false,
              message: 'Wrong password.'
            });
          } else {
            res.json({
              success: true,
              message: 'Successfully login user.',
              data: userInfo
            });
          }
        } else {
          res.json({
            success: false,
            message: 'Email Not Found...'
          });
        }
      });
    }
  }

  // here this api call when user registration is complited after that
  // you can send mail to user for conformation.and after that to set the password.
  result.forgotPassword = (req, res) => {
    console.log(" Inside forgotPassword");
    console.log("Requested body: ", req.body)
    var bodyEmail = req.body.email;
    if (validator.validate(bodyEmail) == false) {
      res.json({
        success: false,
        message: "enter correct email format"
      })
    } else if (req.body.password == undefined || req.body.password == "") {
      res.json({
        success: false,
        message: "please send Password"
      })
    } else {
      User.findOne({
        "email": bodyEmail
      }, (err, userInfo) => {
        if (userInfo) {
          var password = passwordHash.generate(req.body.password);
          User.update({
            "email": bodyEmail
          }, {
            $set: {
              password: password
            }
          }, (err, updatePassword) => {
            //console.log(updatePassword)
            if (updatePassword) {
              res.json({
                success: true,
                msg: "Save password Successfully..."
              })
            } else {
              res.json({
                success: false,
                msg: "Issue In Saving Password..."
              })
            }
          }) // user update
        } else {
          res.json({
            success: false,
            message: 'user not found'
          });
        }
      }) // findOne
    }
  } //setPassword
  
  result.getUserInfo = (req, res) => {
    console.log("In getUserInfo")
    User.findOne({
      _id: req.body.id
    }).exec((err, userResult) => {
      if (err == null) {
        var obj = {
          name: userResult.name,
          email: userResult.email
        }
        res.json({
          success: true,
          data: obj
        });
      } else {
        res.json({
          success: false,
          message: err
        });
      }
    });
  }
  result.editUser = (req, res) => {
    //here only edit name and password
    console.log("Inside editUser");
    //console.log("Requested Body : ", req.body);
    if (req.body.email == undefined || req.body.email == "") {
      console.log("plese enter email...");
      res.json({
        message: "enter email..."
      })
    } else {
      User.findOne({
        email: req.body.email
      }).exec((err, userResult) => {
        if (userResult != null) {
          User.update({
            _id: userResult._id
          }, {
            $set: {
              name: req.body.name,
              email: req.body.email,
              password: passwordHash.generate(req.body.password)
            }
          }).exec((err, updatedInfo) => {
            if (err == null) {
              res.json({
                success: true,
                message: "updated successfully...."
              });
            } else {
              res.json({
                success: false,
                message: "not updated " + err
              });
            }
          })
        } else {
          res.json({
            success: false,
            message: "Enter correct email "
          });
        }
      }) //findone
    } //else
  } //edit user
  result.deleteUser = (req, res) => {
    console.log("Inside deleteUser");
    console.log("Request Body : ", req.body);
    //var id = req.query.userId;
    if (req.body.id == undefined || req.body.id == "") {
      res.json({
        message: "Please Enter User Id"
      })
    } else {
      User.findOne({
        _id: req.body.id
      }).exec((err, userInfo) => {
        //if email is found in database
        if (userInfo) {
          User.remove({
            "_id": req.body.id
          }).exec((err, userResult) => {
            if (userResult) {
              res.json({
                success: true,
                message: "User deleted successfully..."
              });
            } else {
              res.json({
                success: false,
                message: "Error in user deleted..Requested User Not Found "
              });
            }
          })
        } else {
          res.json({
            success: false,
            message: "User Not Found"
          });
        }
      }) //findOne
    } //else
  } //deleteUser

  return result;
}