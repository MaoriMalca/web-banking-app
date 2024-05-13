const express = require('express');
const { signUp, signIn,verifyOtp } = require('../controllers/userController');
const router = express.Router();

router.post('/signUp', signUp);
router.post('/verifyOtp', verifyOtp);
router.post('/signIn', signIn);

module.exports = router;
