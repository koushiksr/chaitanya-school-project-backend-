import Admin from "../models/adminModel";

module.exports.getAdmin = async (req: any, res: any) => {
     try{
     const result = await Admin.find();
     return res.send(result)
     } catch (error) {
          console.error(error)
     }
}