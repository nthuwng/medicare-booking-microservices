import { hashPassword } from "src/services/auth.services";
import { prisma } from "./client";

const initDatabase = async () => {
  const countUser = await prisma.user.count();

  if (countUser === 0) {
    console.log(">>> INIT DATA AUTH_SERVICE...");
    const hashedPassword = await hashPassword("Nth150603");
    await prisma.user.createMany({
      data: [
        {
          email: "admin@gmail.com",
          password: hashedPassword,
          userType: "ADMIN",
        },
        {
          email: "doctor@gmail.com",
          password: hashedPassword,
          userType: "DOCTOR",
        },
        {
          email: "patient@gmail.com",
          password: hashedPassword,
          userType: "PATIENT",
        },
      ],
    });
  }
};

export default initDatabase;
