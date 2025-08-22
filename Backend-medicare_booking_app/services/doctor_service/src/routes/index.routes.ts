import express, { Express } from "express";
import doctorRoutes from "./doctorRoutes";
import clinicRoutes from "./clinicRoutes";
import specialtiesRoutes from "./specialtiesRoutes";
import uploadRoutes from "./uploadRoutes";

const routers = (app: Express) => {
  app.use("/doctors", doctorRoutes);
  app.use("/clinics", clinicRoutes);
  app.use("/specialties", specialtiesRoutes);
  app.use("/upload", uploadRoutes);
};

export default routers;
