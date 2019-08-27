//Require all routes
var express = require('express');
var router = express.Router();

var userController = require('./user')();

router.get('/',function(req, res){
	res.send("HOME..");
});

//user
router.post('/registration',userController.registration);
router.post('/login',userController.login);
router.post('/forgot',userController.forgotPassword);
router.post('/getUserInfo',userController.getUserInfo);
router.put('/editUser',userController.editUser);
router.delete('/deleteUser',userController.deleteUser);

//export router
module.exports = router;
