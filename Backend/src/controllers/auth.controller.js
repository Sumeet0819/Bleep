const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');


async function registerUser(req, res) {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
   const hashPassword = await bcrypt.hash(password, 10);
   const user = new User({ email, password: hashPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,       // Required for HTTPS (Render)
        sameSite: 'none',   // Required for cross-site from localhost to Render
    });
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            email: user.email,
        },
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // if(!user && !isPasswordValid){
    //     return res.status(400).json({ message: 'Invalid credentials' });
    // }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
    res.status(200).json({
        message: 'User logged in successfully',
        user: {
            id: user._id,
            email: user.email,
        },
    });
}
module.exports = { registerUser , loginUser  
}