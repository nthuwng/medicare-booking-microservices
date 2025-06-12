import { Request, Response } from "express";

const testController = (req: Request, res: Response) => {
  res.send("Notification_services 8084 is running ");
};
export default testController;
