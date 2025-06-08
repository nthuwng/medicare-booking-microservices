import { Request, Response } from "express";

const testController = (req: Request, res: Response) => {
  res.send("Payment_services 8085 is running");
};
export default testController;
