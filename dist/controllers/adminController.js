"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminModel_1 = __importDefault(require("../models/adminModel"));
module.exports.getAdmin = async (req, res) => {
    try {
        const result = await adminModel_1.default.find();
        return res.send(result);
    }
    catch (error) {
        console.error(error);
    }
};
