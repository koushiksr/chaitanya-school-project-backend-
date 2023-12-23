"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyStudent = exports.verifySchoolOrStudent = exports.verifySchool = exports.verifyAssessor = exports.verifyAdmin = exports.resetPassword = exports.verifyOTP = exports.verifyEmail = void 0;
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
// const otpGenerator = require('otp-generator');
const loginModel_1 = __importDefault(require("../models/loginModel"));
const secretKey = 'Abcdef@Dev';
let prevOTP = 0;
const verifyEmail = async (req, res) => {
    let isMailSend = false;
    const verified = await loginModel_1.default.findOne({ email: req.params.email });
    if (verified) {
        const generateOTP = () => {
            const min = 100000;
            const max = 999999;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        const otp = generateOTP();
        prevOTP = otp;
        console.log(otp);
        let config = {
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_MAIL_TO_SEND_PASSWORD,
                pass: 'jsug tain gbtm iyks'
            }
        };
        let transporter = nodemailer.createTransport(config);
        let MailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Admin",
                link: 'https://mailgen.js/'
            }
        });
        //mail format
        let response = {
            body: {
                name: 'here is your OTP!',
                // intro: "Your OTP Is Here!",
                table: {
                    data: [
                        {
                            OTP: otp,
                            description: "Use this OTP for forgot password",
                        }
                    ]
                },
                action: {
                    instructions: 'To visit our website, click the link below:',
                    button: {
                        text: 'Visit Our Website',
                        link: process.env.prodUrl,
                    },
                    outro: "Looking forward to do more business"
                }
            }
        };
        // console.log(process.env.school_Dashboard);
        // genarating html maill
        let mail = MailGenerator.generate(response);
        let message = {
            from: process.env.ADMIN_MAIL_TO_SEND_PASSWORD,
            to: req.params.email,
            subject: "Your OTP!",
            html: mail
        };
        // sending mail
        transporter.sendMail(message).then(() => {
            console.log({ msg: "you should receive an email" });
            isMailSend = true;
        }).catch((error) => {
        });
        return res.status(200).json(true);
    }
    else {
        res.status(404).json(false);
    }
};
exports.verifyEmail = verifyEmail;
const verifyOTP = (req, res) => {
    console.log(req.params.otp, prevOTP, 'otp idt');
    if (prevOTP == req.params.otp) {
        res.status(200).send(true);
    }
    else {
        console.log('invalid otp');
        res.status(404).send(false);
    }
};
exports.verifyOTP = verifyOTP;
const resetPassword = async (req, res) => {
    try {
        const updatedLogin = await loginModel_1.default.findOneAndUpdate({ email: req.params.email }, { $set: { password: req.params.newPassword } }, { new: true });
        if (updatedLogin) {
            console.log('Password reset successfully:', updatedLogin);
            return res.status(200).json(true);
        }
        else {
            console.log('Login entry with the specified email not found.');
            return res.status(404).json(false);
        }
    }
    catch (error) {
        console.error('Error resetting password:', error);
    }
};
exports.resetPassword = resetPassword;
router.get('/forgotpassword/:email', exports.verifyEmail);
router.get('/forgotpassword/OTP/:otp', exports.verifyOTP);
router.put('/forgotpassword/resetpassword/:email/:newPassword', exports.resetPassword);
const verifyAdmin = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.status(403).json({ result: 'Invalid token' });
            }
            else {
                req.decoded = decoded;
                if (decoded && decoded.role === 'admin') {
                    next();
                }
                else {
                    res.status(403).json({ result: 'Unauthorized: User is not an admin' });
                }
            }
        });
    }
    else {
        res.status(401).json({ result: 'Token is missing' });
    }
};
exports.verifyAdmin = verifyAdmin;
const verifyAssessor = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.status(403).json({ result: 'Invalid token' });
            }
            else {
                req.decoded = decoded;
                if (decoded && decoded.role === 'assessor') {
                    next();
                }
                else {
                    res.status(403).json({ result: 'Unauthorized: User is not an assessor' });
                }
            }
        });
    }
    else {
        res.status(401).json({ result: 'Token is missing' });
    }
};
exports.verifyAssessor = verifyAssessor;
const verifySchool = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.status(403).json({ result: 'Invalid token' });
            }
            else {
                req.decoded = decoded;
                if (decoded && decoded.role === 'school') {
                    next();
                }
                else {
                    res.status(403).json({ result: 'Unauthorized: User is not an School' });
                }
            }
        });
    }
    else {
        res.status(401).json({ result: 'Token is missing' });
    }
};
exports.verifySchool = verifySchool;
const verifySchoolOrStudent = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.status(403).json({ result: 'Invalid token' });
            }
            else {
                req.decoded = decoded;
                if (decoded && decoded.role === 'school' || decoded.role === 'student') {
                    next();
                }
                else {
                    res.status(403).json({ result: 'Unauthorized: User is not an School Or student' });
                }
            }
        });
    }
    else {
        res.status(401).json({ result: 'Token is missing' });
    }
};
exports.verifySchoolOrStudent = verifySchoolOrStudent;
const verifyStudent = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.status(403).json({ result: 'Invalid token' });
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        res.status(401).json({ result: 'Token is missing' });
    }
};
exports.verifyStudent = verifyStudent;
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await loginModel_1.default.aggregate([
            {
                $match: {
                    email: email,
                    password: password,
                },
            },
            {
                $project: {
                    _id: 0,
                    role: 1,
                },
            },
        ]);
        if (user.length > 0) {
            const userRole = user[0].role;
            const token = jwt.sign({ email, role: userRole }, secretKey, { expiresIn: '1d' });
            res.json({ token, role: userRole });
        }
        else {
            res.status(401).json({ result: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});
exports.default = router;
