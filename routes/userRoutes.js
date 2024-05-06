const express = require('express');
const { signUp, signIn } = require('../controllers/userController');
const router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.post('/verify-otp', verifyOtp);

module.exports = router;
