import { Request, Response } from "express";

const testController = (req: Request, res: Response) => {
  res.send("Doctor_services 8083 is running successfully ");
};
export default testController;
