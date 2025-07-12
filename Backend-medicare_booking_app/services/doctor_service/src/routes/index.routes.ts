import express, { Express } from "express";
import doctorRoutes from "./doctorRoutes";
import clinicRoutes from "./clinicRoutes";
import feeRoutes from "./feeRoutes";
import scheduleRoutes from "./schedule";
import specialtiesRoutes from "./specialtiesRoutes";
import timeSlotRoutes from "./timeSlotRoutes";

const routers = (app: Express) => {
  app.use("/doctors", doctorRoutes);
  app.use("/clinics", clinicRoutes);
  app.use("/fees", feeRoutes);
  app.use("/schedules", scheduleRoutes);
  app.use("/specialties", specialtiesRoutes);
  app.use("/time-slots", timeSlotRoutes);
};

export default routers;
