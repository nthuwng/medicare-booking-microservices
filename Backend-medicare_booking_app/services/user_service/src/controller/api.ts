import { Request, Response } from "express";

const testController = (req: Request, res: Response) => {
  res.send("User_services 8081 is running");    
};
export default testController;