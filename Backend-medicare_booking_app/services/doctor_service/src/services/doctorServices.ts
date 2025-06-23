// const createDoctorProfile = async (
//   body: CreateAdminProfileData,
//   userId: string
// ) => {
//   const { fullName, phone, avatarUrl } = body;

//   //Kiểm tra user có tồn tại trong auth_service
//   const userInfo = await checkUserExits(userId);

//   const admin = await checkTypeAndCreateAdminProfile(
//     userId,
//     fullName,
//     phone,
//     avatarUrl || ""
//   );

//   return {
//     ...admin,
//     userInfo,
//   };
// };

// export { createDoctorProfile };
