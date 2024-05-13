const User = require('../models/User');
const bcrypt = require('bcryptjs');
const twilioClient = require('../utils/twilioClient');
const jwt = require('jsonwebtoken');

exports.signUp = async (req, res) => {
    const { email, password, phoneNumber, balance } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        const otpExpires = new Date(new Date().getTime() + 60 * 60000); // OTP expires in 60 minutes

        // Create user
        const user = await User.create({ email, password, phoneNumber, balance, otp, otpExpires });

        try {
            // Send OTP via SMS
            await twilioClient.messages.create({
                body: `Your OTP code is: ${otp}`,
                to: phoneNumber,
                from: process.env.TWILIO_PHONE_NUMBER
            });
        } catch (twilioError) {
            return res.status(400).json({ error: "Invalid phone number provided", details: twilioError.message });
        }

        res.status(201).json({ message: "OTP sent to your phone" });
    } catch (error) {
        res.status(500).json({ error: "Server error during registration", details: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if OTP is valid and not expired
        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Clear the OTP from the database once verified
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error during verifying OTP", details: error.message });
    }
};

exports.signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, userId: user._id, email: user.email });
    } catch (error) {
        res.status(400).json({ error: "Login failed", details: error.message });
    }
};

