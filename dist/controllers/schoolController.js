"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loginModel_1 = __importDefault(require("../models/loginModel"));
const schoolModel_1 = __importDefault(require("../models/schoolModel"));
const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
exports.getSchoolAdmin = async (req, res) => {
    try {
        const email = req.params.id;
        const admin_login = await loginModel_1.default.findOne({ email });
        const admin_details = await schoolModel_1.default.findOne({ schoolEmail: email });
        return res.send({ admin_login, admin_details });
    }
    catch (error) {
        console.error(error);
    }
};
exports.create = async (req, res) => {
    try {
        let isMailSend = false;
        const { schoolEmail, schoolName, } = req.body;
        const school = await schoolModel_1.default.findOne({ schoolEmail });
        const login = await loginModel_1.default.findOne({ email: schoolEmail });
        console.log(school, login);
        if (!school && !login) {
            // genarate random password
            function generateRandomPassword(length) {
                const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                let password = "";
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * charset.length);
                    password += charset.charAt(randomIndex);
                }
                return password;
            }
            const randomPassword = generateRandomPassword(10);
            //send randomly genarated password to  school mail
            const SendEmailToSchool = async () => {
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
                        name: schoolName,
                        intro: "Your Password Is Here!",
                        table: {
                            data: [
                                {
                                    Password: randomPassword,
                                    description: "Use this password for further login",
                                }
                            ]
                        },
                        action: {
                            instructions: 'To visit our website, click the link below:',
                            button: {
                                text: 'Visit Our Website',
                                link: process.env.school_Dashboard,
                            },
                            outro: "Looking forward to do more business"
                        }
                    }
                };
                // genarating html maill
                let mail = MailGenerator.generate(response);
                let message = {
                    from: process.env.ADMIN_MAIL_TO_SEND_PASSWORD,
                    to: schoolEmail,
                    subject: "school password",
                    html: mail
                };
                // sending mail
                transporter.sendMail(message).then(() => {
                    console.log({ msg: "you should receive an email" });
                    isMailSend = true;
                }).catch((error) => {
                });
            };
            req.body.password = randomPassword;
            // schoolId genarating 
            const schoolIdGenarate = async () => {
                let schoolCity = req.body.schoolCity;
                let syllabusType = req.body.schoolType;
                try {
                    const latestSchool = await schoolModel_1.default.findOne().sort({ createdAt: -1 }).exec();
                    console.log({ latestSchool });
                    const temp_id = latestSchool ? latestSchool.schoolID : 'ABCDE00000';
                    console.log({ temp_id });
                    let newString = schoolCity.toUpperCase().slice(0, 3) + syllabusType.toUpperCase().slice(0, 2) + (parseInt(temp_id.slice(-5)) + 1).toString().padStart(5, '0');
                    console.log({ newString });
                    if (newString) {
                        req.body.schoolID = newString;
                        console.log(req.body.schoolID, 'schoolid');
                    }
                }
                catch (error) {
                    console.error(error);
                }
            };
            await SendEmailToSchool();
            await schoolIdGenarate();
            // posting data  in both school and login
            console.log(isMailSend, req.body.schoolID, req.body.password);
            if (req.body.schoolID && req.body.password) {
                const newSchool = await schoolModel_1.default.create(req.body);
                const logEntry = await loginModel_1.default.create({ email: schoolEmail, password: randomPassword, role: 'school' });
                if (newSchool) {
                    return res.status(200).send(true);
                }
            }
        }
        if (school || login) {
            return res.status(200).send(false);
        }
        return res.status(404).send(null);
    }
    catch (error) {
        console.error(error);
    }
};
exports.getAllSchool = async (req, res) => {
    try {
        const school = await schoolModel_1.default.find();
        if (!school) {
            return res.status(401).json({ message: 'there is no data in database' });
        }
        res.json(school);
    }
    catch (error) {
        console.error(error);
    }
};
exports.editSchool = async (req, res) => {
    try {
        const { schoolName, schoolID, contactName, contactNo, schoolEmail, schoolType, principalName, principalContact, principalEmail, classesFrom, classesTo, totalStudents, noOfBoys, noOfGirls, } = req.body;
        const result = await schoolModel_1.default.updateOne({ _id: Object(req.params.id) }, {
            $set: {
                schoolName,
                schoolID,
                contactName,
                contactNo,
                schoolEmail,
                schoolType,
                principalName,
                principalContact,
                principalEmail,
                classesFrom,
                classesTo,
                totalStudents,
                noOfBoys,
                noOfGirls,
            }
        });
        // console.log(result)
        if (result.modifiedCount === 1) {
            console.log('Document updated successfully');
            res.status(200).send({
                message: 'Document updated successfully',
                result
            });
        }
        else if (result.modifiedCount === 0) {
            console.log('Document not updated ');
            res.status(200).send({
                message: 'Document not updated ',
                result
            });
        }
        else {
            console.log('Document not found or not updated');
            res.status(404).send({
                message: 'Document not found or not updated',
                result
            });
        }
    }
    catch (error) {
        console.error(error);
    }
};
exports.deleteSchool = async (req, res) => {
    try {
        const result = await schoolModel_1.default.deleteOne({ _id: Object(req.params.id) });
        if (result.deletedCount === 1) {
            console.log('Document deleted successfully');
            res.json({ message: 'deleted successfully' });
        }
        else {
            console.log('Document not found or not deleted');
        }
    }
    catch (error) {
        console.error(error);
    }
};
