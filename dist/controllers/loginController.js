"use strict";
const loginService = require('../services/loginService');
exports.login = async (req, res) => {
    try {
        const login = await loginService.login();
        res.json(login);
    }
    catch (error) {
        console.error(error);
    }
};