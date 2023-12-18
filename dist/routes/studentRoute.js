"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loginRoute_1 = require("./loginRoute");
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const activityController = require('../controllers/activityController');
router.get('/admin/:id', loginRoute_1.verifyStudent, studentController.getStudentAdmin);
// for assessor
router.get('/activity/assessor/:schoolID?/:candidateID?', loginRoute_1.verifyAssessor, activityController.getAllforAssessor);
router.post('/activity/assessor/create', loginRoute_1.verifyAssessor, activityController.createbyAssesser);
//for other
router.get('/activity/progress/:SchoolID/:candidateID/:activity', loginRoute_1.verifyStudent, activityController.getLast4ActivityBycandidateID);
router.get('/activity/:schoolID/:candidateID', loginRoute_1.verifyStudent, activityController.getAll);
router.get('/activity/:schoolID/:activity?/:rating?', loginRoute_1.verifySchool, activityController.getAllActivityBySchoolID);
router.post('/activity/create', loginRoute_1.verifyStudent, activityController.create);
router.put('/activity/edit/:id', loginRoute_1.verifyStudent, activityController.edit);
router.delete('/activity/delete/:id', loginRoute_1.verifyStudent, activityController.delete);
exports.default = router;
