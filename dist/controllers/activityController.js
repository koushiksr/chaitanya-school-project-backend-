"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process = __importStar(require("process"));
const activityModel_1 = __importDefault(require("../models/activityModel"));
const studentModel_1 = __importDefault(require("../models/studentModel"));
const mailgen_1 = __importDefault(require("mailgen"));
const nodemailer_1 = __importDefault(require("nodemailer"));
module.exports.create = async (req, res) => {
    try {
        let isMailSend = false;
        const { formData, schoolID, candidateID } = req.body;
        const student = await studentModel_1.default.findOne({ candidateID });
        if (student) {
            const details = await studentModel_1.default.aggregate([
                {
                    $match: { candidateID }
                },
                {
                    $lookup: {
                        from: "schools",
                        localField: "schoolID",
                        foreignField: "schoolID",
                        as: "schoolInfo"
                    }
                },
                {
                    $unwind: "$schoolInfo"
                },
                {
                    $unset: ["createdAt", "updatedAt", "__v", "schoolInfo.createdAt", "schoolInfo.updatedAt", "schoolInfo.__v"]
                },
                {
                    $project: {
                        _id: 0,
                        Name: "$candidateName",
                        ID: "$candidateID",
                        Gender: "$gender",
                        DOB: "$dob",
                        Age: "$age",
                        Class: "$candidateClass",
                        DominantSide: "$dominantSide",
                        ParentName: "$parentName",
                        ParentMobileNo: "$parentMobileNo",
                        AlternateNo: "$alternateNo",
                        email: "$email",
                        ResidenceArea: "$residenceArea",
                        ResidenceCity: "$residenceCity",
                        SchoolName: "$schoolInfo.schoolName",
                        SchoolID: "$schoolInfo.schoolID",
                        SchoolContactName: "$schoolInfo.contactName",
                        SchoolContactNumber: "$schoolInfo.contactNo",
                        SchoolContactEmailID: "$schoolInfo.schoolEmail",
                    }
                }
            ]);
            details[0].AssessmentDate = formData.AssessmentDate;
            await activityModel_1.default.create(details)
                .then(async (createdActivity) => {
                let config = {
                    service: 'gmail',
                    auth: {
                        user: 'technohmsit@gmail.com',
                        pass: 'jsug tain gbtm iyks'
                    }
                };
                let transporter = await nodemailer_1.default.createTransport(config);
                let MailGenerator = new mailgen_1.default({
                    theme: "default",
                    product: {
                        name: "Admin",
                        link: 'https://mailgen.js/'
                    }
                });
                let response = {
                    body: {
                        name: "Assessor",
                        intro: `${student.candidateName}  Is Created Assignment`,
                        action: {
                            instructions: 'To visit website to assign date, click the link below:',
                            button: {
                                text: 'Visit Our Website',
                                link: 'https://www.example.com',
                            },
                            outro: "thanks for attention"
                        }
                    }
                };
                let mail = await MailGenerator.generate(response);
                let message = {
                    from: 'technohmsit@gmail.com',
                    to: process.env.ASSESSOR,
                    subject: "activity created",
                    html: mail
                };
                await transporter.sendMail(message).then(() => {
                    console.log({ msg: "you should receive an email" });
                    isMailSend = true;
                }).catch((error) => {
                });
                if (isMailSend) {
                    return res.status(201).json({
                        message: 'Activity created successfully', activity: createdActivity
                    });
                }
            })
                .catch((error) => {
                res.status(500).json({ error: 'Internal Server Error', details: error.message });
            });
        }
        else {
            res.status(404).send(null);
        }
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.createbyAssesser = async (req, res) => {
    try {
        let isMailSend = false;
        const { formData, schoolID, candidateID } = req.body;
        const student = await studentModel_1.default.findOne({ candidateID });
        if (student) {
            const details = await studentModel_1.default.aggregate([
                {
                    $match: { candidateID }
                },
                {
                    $lookup: {
                        from: "schools",
                        localField: "schoolID",
                        foreignField: "schoolID",
                        as: "schoolInfo"
                    }
                },
                {
                    $unwind: "$schoolInfo"
                },
                {
                    $unset: ["createdAt", "updatedAt", "__v", "schoolInfo.createdAt", "schoolInfo.updatedAt", "schoolInfo.__v"]
                },
                {
                    $project: {
                        _id: 0,
                        Name: "$candidateName",
                        ID: "$candidateID",
                        Gender: "$gender",
                        DOB: "$dob",
                        Age: "$age",
                        Class: "$candidateClass",
                        DominantSide: "$dominantSide",
                        ParentName: "$parentName",
                        ParentMobileNo: "$parentMobileNo",
                        AlternateNo: "$alternateNo",
                        email: "$email",
                        ResidenceArea: "$residenceArea",
                        ResidenceCity: "$residenceCity",
                        SchoolName: "$schoolInfo.schoolName",
                        SchoolID: "$schoolInfo.schoolID",
                        SchoolContactName: "$schoolInfo.contactName",
                        SchoolContactNumber: "$schoolInfo.contactNo",
                        SchoolContactEmailID: "$schoolInfo.schoolEmail",
                    }
                }
            ]);
            details[0].AssessmentDate = formData.AssessmentDate;
            await activityModel_1.default.create(details)
                .then(async (createdActivity) => {
                let config = {
                    service: 'gmail',
                    auth: {
                        user: 'technohmsit@gmail.com',
                        pass: 'jsug tain gbtm iyks'
                    }
                };
                let transporter = await nodemailer_1.default.createTransport(config);
                let MailGenerator = new mailgen_1.default({
                    theme: "default",
                    product: {
                        name: "Admin",
                        link: 'https://mailgen.js/'
                    }
                });
                let response = {
                    body: {
                        name: student.candidateName,
                        intro: "Assessor Is Created Your Assignment",
                        action: {
                            instructions: 'To visit website to assign date, click the link below:',
                            button: {
                                text: 'Visit Our Website',
                                link: 'https://www.example.com',
                            },
                            outro: "thanks for attention"
                        }
                    }
                };
                let mail = await MailGenerator.generate(response);
                let message = {
                    from: 'technohmsit@gmail.com',
                    to: student.email,
                    subject: "activity created",
                    html: mail
                };
                await transporter.sendMail(message).then(() => {
                    console.log({ msg: "you should receive an email" });
                    isMailSend = true;
                }).catch((error) => {
                });
                if (isMailSend) {
                    req.body.formData.ongoing = false;
                    const result = await activityModel_1.default.updateOne({ _id: createdActivity[0]._id }, {
                        $set: req.body.formData
                    });
                    if (result.matchedCount === 1) {
                        console.log('Date updated successfully');
                    }
                    else {
                        console.log('Date not found or not updated');
                    }
                    return res.status(201).json({
                        message: 'Activity created successfully', activity: result
                    });
                }
            })
                .catch((error) => {
                res.status(500).json({ error: 'Internal Server Error', details: error.message });
            });
        }
        else {
            res.status(404).send(null);
        }
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.getAllforAssessor = async (req, res) => {
    try {
        const { schoolID, candidateID } = req.params;
        const matchData = {
            ...(schoolID !== "undefined" && { SchoolID: schoolID }),
            ...(candidateID !== "undefined" && { ID: candidateID }),
        };
        const activity = await activityModel_1.default.aggregate([{ $match: matchData }]);
        return activity && activity.length
            ? res.json(activity)
            : (activity != null ? res.status(200).json([]) : res.status(404).json({ message: 'something wrong' }));
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.getAll = async (req, res) => {
    try {
        const student = await activityModel_1.default.find({ SchoolID: req.params.schoolID, ID: req.params.candidateID });
        if (!student) {
            return res.status(404).json({ message: 'there is no data in database' });
        }
        res.json(student);
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.getAllActivityBySchoolID = async (req, res) => {
    try {
        console.log(req.params);
        const activity = req.params.activity;
        const rating = req.params.rating;
        const schoolID = req.params.schoolID;
        if (activity && rating) {
            const studentFiltered = await activityModel_1.default.aggregate([
                {
                    $match: {
                        SchoolID: schoolID,
                        [activity]: rating,
                    },
                }
            ]);
            console.log({ studentFiltered });
            if (studentFiltered == null) {
                return res.status(200).json([]);
            }
            else {
                res.status(200).json(studentFiltered);
            }
        }
        else {
            const student = await activityModel_1.default.find({ SchoolID: schoolID });
            if (!student) {
                return res.status(404).json({ message: 'there is no data in database' });
            }
            else {
                res.json(student);
            }
        }
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.getLast4ActivityBycandidateID = async (req, res) => {
    try {
        const activity = req.params.activity;
        const candidateID = req.params.candidateID;
        const SchoolID = req.params.SchoolID;
        if (activity) {
            const studentFiltered = await activityModel_1.default.aggregate([
                { $match: { ID: candidateID, SchoolID, ongoing: false } },
                { $sort: { createdAt: -1 } },
                { $limit: 4 },
                { $project: { [activity]: 1, _id: 0, createdAt: 1 } }
            ]);
            console.log(studentFiltered);
            if (!studentFiltered) {
                return res.status(404).json({ message: 'not found any data ' });
            }
            else {
                res.status(200).json(studentFiltered);
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(404).send({ message: ' something went wrong' });
    }
};
module.exports.edit = async (req, res) => {
    try {
        if (req.body.BMI) {
            req.body.ongoing = false;
        }
        const result = await activityModel_1.default.updateOne({ _id: Object(req.params.id) }, {
            $set: req.body
        });
        if (result.matchedCount === 1) {
            console.log('Date updated successfully');
        }
        else {
            console.log('Date not found or not updated');
        }
        res.send(result);
    }
    catch (error) {
        console.error(error);
    }
};
module.exports.delete = async (req, res) => {
    try {
        if (req.params.id !== 'undefined') {
            const result = await activityModel_1.default.deleteOne({ _id: Object(req.params.id) });
            if (result.deletedCount === 1) {
                console.log('Document deleted successfully');
                res.json({ message: 'deleted successfully' });
            }
            else {
                console.log('Document not found or not deleted');
            }
        }
    }
    catch (error) {
        console.error(error);
    }
};
