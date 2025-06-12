import { Request, Response } from "express";

const testController = (req: Request, res: Response) => {
  res.send("Appointment_services 8082 is running ");
};
export default testController;
