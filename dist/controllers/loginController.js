"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loginService = require('../services/loginService');
module.exports.login = async (req, res) => {
    try {
        const login = await loginService.login();
        res.json(login);
    }
    catch (error) {
        console.error(error);
    }
};
