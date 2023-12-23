"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loginModel_1 = __importDefault(require("../models/loginModel"));
const studentModel_1 = __importDefault(require("../models/studentModel"));
const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
module.exports.getStudentAdmin = async (req, res) => {
    try {
        const result = await studentModel_1.default.find({ email: req.params.id });
        return res.send(result);
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.create = async (req, res) => {
    try {
        const { candidateName, email } = req.body;
        const student = await studentModel_1.default.findOne({ email: email });
        const inLogin = await loginModel_1.default.findOne({ email: email });
        let isMailSend1 = false;
        let randomPassword = '';
        let studentCredentials;
        if (student == null && inLogin == null) {
            const passwordGenaration = async () => {
                async function generateRandomPassword(length) {
                    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                    let password = "";
                    for (let i = 0; i < length; i++) {
                        const randomIndex = Math.floor(Math.random() * charset.length);
                        password += charset.charAt(randomIndex);
                    }
                    return password;
                }
                randomPassword = await generateRandomPassword(10);
                req.body.password = randomPassword;
            };
            //send  password to  school mail
            const sendMail = async () => {
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
                let response = {
                    body: {
                        name: candidateName,
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
                                link: process.env.student_Dashboard,
                            },
                            outro: "Looking forward to do more business"
                        }
                    }
                };
                let mail = MailGenerator.generate(response);
                let message = {
                    from: process.env.ADMIN_MAIL_TO_SEND_PASSWORD,
                    to: email,
                    subject: "Your password",
                    html: mail
                };
                try {
                    await transporter.sendMail(message);
                    console.log({ msg: "user should receive an email", email });
                    isMailSend1 = true;
                }
                catch (error) {
                    console.error('Error sending email to student:', error);
                }
                let response2 = {
                    body: {
                        name: "New student  created",
                        // intro: "Your Password Is Here!",
                        table: {
                            data: [
                                {
                                    email: email,
                                    description: `student ${candidateName}  profile created `,
                                }
                            ]
                        },
                        action: {
                            instructions: 'To visit our website, click the link below:',
                            button: {
                                text: 'Visit Our Website',
                                link: process.env.admin_Dashboard,
                            },
                            // outro: "Looking forward to do more business"
                        }
                    }
                };
                let mail2 = MailGenerator.generate(response2);
                let message2 = {
                    from: process.env.ADMIN_MAIL_TO_SEND_PASSWORD,
                    to: process.env.ADMIN_MAIL_TO_GET_UPDATES,
                    subject: "new student created by school",
                    html: mail2
                };
                try {
                    await transporter.sendMail(message2);
                    console.log({ msg: "Admin should receive an email", email });
                    // isMailSend2 = true;
                }
                catch (error) {
                    console.error('Error sending email to admin:', error);
                }
            };
            //schoolId genarating 
            const schoolIdGenarate = async () => {
                let studentCity = req.body.residenceCity;
                let gender = req.body.gender;
                try {
                    const latestStudent = await studentModel_1.default.findOne({ schoolID: req.body.schoolID }).sort({ createdAt: -1 }).exec();
                    const temp_id = latestStudent ? latestStudent.candidateID : 'ABCD0000000';
                    let newString = studentCity.toUpperCase().slice(0, 3) + gender.toUpperCase().slice(0, 1) + (parseInt(temp_id.slice(-7)) + 1).toString().padStart(7, '0');
                    req.body.candidateID = newString;
                }
                catch (error) {
                    console.error(error);
                }
            };
            //calling step by ste
            await passwordGenaration();
            await sendMail();
            await schoolIdGenarate();
            if (req.body.password == 'undefined') {
                return res.status(200).send({ message: 'error in creating password', studentCreated: false });
            }
            if (req.body.candidateID == 'undefined') {
                return res.status(200).send({ message: 'error in creating candidate ID', studentCreated: false });
            }
            if (!isMailSend1) {
                return res.status(200).send({ message: 'error in sending mail to student ', studentCreated: false });
            }
            if (isMailSend1) {
                const newStudent = await studentModel_1.default.create(req.body);
                if (newStudent) {
                    studentCredentials = await loginModel_1.default.create({ email: email, password: req.body.password, role: 'student' });
                }
                if (studentCredentials) {
                    return res.status(200).send({ message: 'student created successfully', studentCreated: true });
                }
            }
        }
        if (student || inLogin) {
            return res.status(200).send({ message: 'email already exist', studentCreated: false });
        }
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.getAllStudent = async (req, res) => {
    try {
        const student = await studentModel_1.default.find({ schoolID: req.params.schoolID });
        if (!student) {
            return res.status(401).json({ message: 'there is no data in database' });
        }
        res.json(student);
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.getAllStudentByClassGender = async (req, res) => {
    try {
        const { schoolID, candidateClass, gender } = req.params;
        const matchData = {
            ...(schoolID !== "undefined" && { schoolID }),
            ...(candidateClass !== "undefined" && { candidateClass }),
            ...(gender !== "undefined" && { gender }),
        };
        const student = await studentModel_1.default.aggregate([{ $match: matchData }]);
        return student && student.length
            ? res.json(student)
            : (student != null ? res.status(200).json([]) : res.status(404).json({ message: 'something wrong' }));
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.editStudent = async (req, res) => {
    try {
        const { candidateName, candidateID, gender, dob, age, class: candidateClass, dominantSide, parentName, parentMobileNo, alternateNo, email, residenceArea, residenceCity, } = req.body;
        const result = await studentModel_1.default.updateOne({ _id: Object(req.params.id) }, {
            $set: {
                candidateName,
                candidateID,
                gender,
                dob,
                age,
                class: candidateClass,
                dominantSide,
                parentName,
                parentMobileNo,
                alternateNo,
                email,
                residenceArea,
                residenceCity,
            }
        });
        if (result.nModified === 1) {
            console.log('Document updated successfully');
        }
        else {
            console.log('Document not found or not updated');
        }
        res.send(result);
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.deleteStudent = async (req, res) => {
    try {
        const result1 = await studentModel_1.default.deleteOne({ email: req.params.id });
        const result2 = await loginModel_1.default.deleteOne({ email: req.params.id, role: 'student' });
        if (result1.deletedCount === 1 && result2.deletedCount === 1) {
            console.log('Document deleted successfully');
            res.json({ message: 'deleted successfully' });
        }
        else if (result1.deletedCount === 1 || result2.deletedCount === 1) {
            console.log('partially deleted');
            res.json({ message: 'partially deleted' });
        }
        else {
            console.log('Document not found or not deleted');
            res.json({ message: 'Document not found or not deleted' });
        }
    }
    catch (error) {
        res.json({ message: 'something went wrong' });
    }
};
