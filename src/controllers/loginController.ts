import * as process from 'process';
const loginService = require('../services/loginService');

module.exports.login = async (req: any, res: { json: (arg0: any) => void; }) => {
     try {        
          const login = await loginService.login();
          res.json(login);
     } catch (error) {
          console.error(error)   
     }
};