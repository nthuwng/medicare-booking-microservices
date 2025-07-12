import { ApprovalStatus, Gender, Title } from "@prisma/client";
import { prisma } from "src/config/client";

const createDoctor = async (
  userId: string,
  fullName: string,
  phone: string,
  avatar_url: string,
  clinic_ids: number[],
  specialty_ids: number[],
  bio: string,
  experience_years: number,
  gender: string,
  title: string
) => {
  return prisma.doctor.create({
    data: {
      userId: userId,
      fullName: fullName,
      phone,
      avatarUrl: avatar_url,
      bio,
      experienceYears: +experience_years,
      gender: gender as Gender,
      title: title as Title,
      specialties: {
        create: specialty_ids.map((specialtyId) => ({
          specialtyId: specialtyId,
        })),
      },
      clinics: {
        create: clinic_ids.map((clinicId) => ({
          clinicId: clinicId,
        })),
      },
    },
    include: {
      specialties: {
        include: {
          specialty: true,
        },
      },
      clinics: {
        include: {
          clinic: true,
        },
      },
    },
  });
};

const findDoctorByUserId = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: userId },
    include: {
      specialties: {
        include: {
          specialty: true,
        },
      },
      clinics: {
        include: {
          clinic: true,
        },
      },
    },
  });
  return doctor;
};

const findDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: id },
    include: {
      specialties: {
        include: {
          specialty: true,
        },
      },
      clinics: {
        include: {
          clinic: true,
        },
      },
    },
  });
  return doctor;
};

const addDoctorSpecialty = async (doctorId: string, specialtyId: number) => {
  return prisma.doctorSpecialty.create({
    data: {
      doctorId,
      specialtyId,
    },
    include: {
      specialty: true,
    },
  });
};

const removeDoctorSpecialty = async (doctorId: string, specialtyId: number) => {
  return prisma.doctorSpecialty.delete({
    where: {
      doctorId_specialtyId: {
        doctorId,
        specialtyId,
      },
    },
  });
};

const addDoctorClinic = async (doctorId: string, clinicId: number) => {
  return prisma.doctorClinic.create({
    data: {
      doctorId,
      clinicId,
    },
    include: {
      clinic: true,
    },
  });
};

const removeDoctorClinic = async (doctorId: string, clinicId: number) => {
  return prisma.doctorClinic.delete({
    where: {
      doctorId_clinicId: {
        doctorId,
        clinicId,
      },
    },
  });
};

const getDoctorsBySpecialty = async (specialtyId: number) => {
  return prisma.doctor.findMany({
    where: {
      specialties: {
        some: {
          specialtyId: specialtyId,
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      experienceYears: true,
      avatarUrl: true,
      approvalStatus: true,
      title: true,
      specialties: {
        where: { isActive: true },
        select: {
          specialty: {
            select: {
              id: true,
              specialtyName: true,
              iconPath: true,
            },
          },
        },
      },
      clinics: {
        where: { isActive: true },
        select: {
          clinic: {
            select: {
              id: true,
              clinicName: true,
              city: true,
              district: true,
            },
          },
        },
      },
    },
  });
};

const getDoctorsByClinic = async (clinicId: number) => {
  return prisma.doctor.findMany({
    where: {
      clinics: {
        some: {
          clinicId: clinicId,
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      experienceYears: true,
      avatarUrl: true,
      approvalStatus: true,
      title: true,
      specialties: {
        where: { isActive: true },
        select: {
          specialty: {
            select: {
              id: true,
              specialtyName: true,
              iconPath: true,
            },
          },
        },
      },
      clinics: {
        where: { isActive: true },
        select: {
          clinic: {
            select: {
              id: true,
              phone: true,
              clinicName: true,
              street: true,
              city: true,
              district: true,
            },
          },
        },
      },
    },
  });
};

export {
  findDoctorByUserId,
  createDoctor,
  findDoctorById,
  addDoctorSpecialty,
  removeDoctorSpecialty,
  addDoctorClinic,
  removeDoctorClinic,
  getDoctorsBySpecialty,
  getDoctorsByClinic,
};
