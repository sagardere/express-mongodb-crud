var express = require('express');
var router = express.Router();

var userController = require('./user')();


//user
router.post('/registration',userController.registration);
router.post('/login',userController.login);
router.post('/setPassword',userController.setPassword);
router.post('/getUserInfo',userController.getUserInfo);
router.post('/isAuthenticateToken',userController.isAuthenticateToken);
router.post('/logout',userController.logout);
router.put('/editUser',userController.editUser);
router.delete('/deleteUser',userController.deleteUser);

//export router
module.exports = router;
