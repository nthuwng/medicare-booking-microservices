import { Request, Response } from "express";

const testController = (req: Request, res: Response) => {
  res.send("Rating_services 8087 is running ");
};
export default testController;
