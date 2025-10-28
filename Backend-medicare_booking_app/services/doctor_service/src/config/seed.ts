
import { prisma } from "./client";


type SeedClinic = {
  clinicName: string;
  city: "Hanoi" | "HoChiMinh";
  district: string;
  street: string;
  phone: string;
  description: string;
  iconPath: string;
};

type SeedSpecialty = {
  specialtyName: string;
  iconPath: string;
  description: string;
};

const CLINIC_SEEDS: SeedClinic[] = [
  {
    clinicName: "Bệnh viện Da Liễu",
    city: "HoChiMinh",
    district: "Quận 3",
    street: "Số 2, đường Nguyễn Thông, Phường Xuân Hòa",
    phone: "02839301396",
    description:
      "Bệnh viện Da Liễu là đơn vị sự nghiệp trực thuộc Sở Y tế Thành phố Hồ Chí Minh, là bệnh viện chuyên khoa hạng I - tuyến chuyên khoa cao nhất của thành phố và các tỉnh phía Nam về các bệnh Da, Phong và các Nhiễm khuẩn lây qua tình dục, được Bộ Y tế giao nhiệm vụ phụ trách chỉ đạo tuyến, xây dựng màng lưới da liễu 21 tỉnh, thành phía Nam từ Ninh Thuận đến Cà Mau.",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1756105207/medicare/dde68jcut4n6os15n3ww.png",
  },
  {
    clinicName: "Bệnh viện Nhi Đồng Thành phố",
    city: "Hanoi",
    district: "Bình Chánh",
    street: "15 đường Võ Trần Chí , Tân Kiên",
    phone: "19001217",
    description:
      "Bệnh viện Nhi Đồng Thành phố là một bệnh viện nhi khoa hiện đại bậc nhất Việt Nam, tọa lạc tại 15 Võ Trần Chí, Tân Nhựt, Bình Chánh, TP. HCM. Bệnh viện có quy mô lớn với 1.000 giường bệnh, trang thiết bị hiện đại nhập khẩu từ G7, và nhiều chuyên khoa sâu, bao gồm cả khoa xạ trị và y học hạt nhân dành riêng cho trẻ em. Bệnh viện cũng có bãi đáp trực thăng và khu vui chơi cho trẻ em.",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760341555/B%E1%BB%87nh_vi%E1%BB%87n_nhi_%C4%91%E1%BB%93ng_th%C3%A0nh_ph%E1%BB%91_ufbyb4.jpg",
  },
  {
    clinicName: "Bệnh viện Bạch Mai",
    city: "Hanoi",
    district: "Đống Đa",
    street: "78 đường Giải Phóng, phường Phương Mai",
    phone: "1900888866",
    description:
      "Bệnh viện Bạch Mai là một bệnh viện đa khoa hoàn chỉnh tuyến đầu của Việt Nam, tọa lạc tại số 78 Giải Phóng, Đống Đa, Hà Nội, với lịch sử hơn 100 năm hình thành và phát triển. Bệnh viện nổi tiếng với đội ngũ y bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại và quy mô lớn, bao gồm 1400 giường bệnh và hơn 56 đơn vị trực thuộc. Ngoài chức năng khám chữa bệnh, Bạch Mai còn là trung tâm đào tạo, nghiên cứu y học quan trọng và là cơ sở thực hành chính của Đại học Y Hà Nội.",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760341862/B%E1%BA%A1ch_mai_ozpjfj.png",
  },
  {
    clinicName: "Viện Huyết học - Truyền máu Trung ương",
    city: "Hanoi",
    district: "Đống Đa",
    street: "Số 1 Hoàng Cầu",
    phone: "0243203 0032",
    description:
      "Viện Huyết học – Truyền máu Trung ương ra đời vào ngày 31/12/1984 theo Quyết định số 1531/BYT-QĐ của Bộ trưởng Bộ Y tế với tên gọi ban đầu là Viện Huyết học và Truyền máu, thuộc Bệnh viện Bạch Mai, do GS. Bạch Quốc Tuyên là Viện trưởng. Viện thành lập trên cơ sở sáp nhập hai đơn vị là Khoa Huyết học – Truyền máu và Phòng Bệnh máu (C5).",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760342113/Vi%E1%BB%87n_huy%E1%BA%BFt_h%E1%BB%8Dc_truy%E1%BB%81n_m%C3%A1u_trung_%C6%B0%C6%A1ng_uexqzv.png",
  },
  {
    clinicName: "Bệnh viện Mắt",
    city: "HoChiMinh",
    district: "Quận 3",
    street: "280 Điện Biên Phủ, Phường Võ Thị Sáu",
    phone: "19002115",
    description:
      "Bệnh viện Mắt Thành phố Hồ Chí Minh là bệnh viện chuyên khoa hạng I, là một trong những trung tâm nhãn khoa hàng đầu Việt Nam, chuyên khám và điều trị các bệnh về mắt cho người dân phía Nam. Bệnh viện có đa dạng các chuyên khoa, sử dụng các kỹ thuật hiện đại như phẫu thuật Phaco, laser điều trị tật khúc xạ, ghép giác mạc, và điều trị glaucoma. Bệnh viện cũng chú trọng đầu tư trang thiết bị tiên tiến và phát triển đội ngũ chuyên gia.",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760342476/M%E1%BA%AFt_nlqp1e.png",
  },
  {
    clinicName: "Bệnh viện Trung ương Quân đội 108",
    city: "Hanoi",
    district: "Hai Bà Trưng",
    street: "Số 1 Trần Hưng Đạo",
    phone: "0971830166",
    description:
      "Bệnh viện Trung ương Quân đội 108 là một bệnh viện hạng đặc biệt quốc gia, tuyến cuối của ngành Quân y, chuyên sâu về đa khoa và y học lâm sàng. Bệnh viện được thành lập từ năm 1951, có nhiệm vụ bảo vệ và chăm sóc sức khỏe cho cán bộ cấp cao, đồng thời thực hiện nghiên cứu khoa học và đào tạo sau đại học. Nơi đây nổi tiếng với đội ngũ y bác sĩ giàu kinh nghiệm, cơ sở vật chất hiện đại và nhiều thành tựu y khoa nổi bật như ghép chi thể.",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760342867/benhvien_108_b6mx8k.png",
  },
  {
    clinicName: "Bệnh viện Chợ Rẫy",
    city: "HoChiMinh",
    district: "Quận 5",
    street: "201B Nguyễn Chí Thanh , Chợ lớn",
    phone: "0971830166",
    description:
      "Bệnh viện Chợ Rẫy là một bệnh viện hạng đặc biệt tuyến trung ương, trực thuộc Bộ Y tế, là trung tâm y tế lớn hàng đầu tại phía Nam và cả nước, có lịch sử lâu đời và chuyên môn cao. Bệnh viện nổi bật với đội ngũ y bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại, thực hiện đa dạng kỹ thuật cao như phẫu thuật ghép tạng, can thiệp tim mạch, xạ trị ung thư, và là một trong những đơn vị đầu tiên triển khai phẫu thuật robot. Bệnh viện nằm tại trung tâm TP. Hồ Chí Minh và là địa điểm khám chữa bệnh uy tín cho người dân từ TP.HCM đến các tỉnh phía Nam.",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760343000/benh-vien-cho-ray_md2piu.webp",
  },
];

const SPECIALTY_SEEDS: SeedSpecialty[] = [
  {
    specialtyName: "Da liễu",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1759916022/medicare/pc6ohh91phjytjeusaml.png",
    description:
      "Da liễu là thuật ngữ y khoa chỉ các bệnh lý ảnh hưởng đến da, tóc, móng và các cấu trúc liên quan như tuyến mồ hôi. Đây là một lĩnh vực của y học chuyên về việc chẩn đoán, điều trị và phòng ngừa các tình trạng này, từ nhẹ như ngứa, phát ban đến nghiêm trọng như ung thư da.",
  },
  {
    specialtyName: "Nhi khoa",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1755858214/medicare/uvff4zwe0u9e3tukm4oj.png",
    description:
      "Nhi khoa (tiếng Anh là Paediatrics) là ngành y học chuyên về chăm sóc sức khỏe toàn diện cho trẻ em, từ sơ sinh, trẻ nhỏ đến thanh thiếu niên (thường đến 15-21 tuổi, tùy quốc gia). Ngành này bao gồm việc chẩn đoán và điều trị các bệnh lý nội khoa, ngoại khoa, và các vấn đề về tăng trưởng, phát triển, tâm lý, xã hội của trẻ, với mục tiêu giảm tỷ lệ tử vong ở trẻ em và nuôi dưỡng sự phát triển khỏe ",
  },
  {
    specialtyName: "Nha khoa",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1759916067/medicare/e3kd6gjhxyhm0tlml48v.png",
    description:
      "Nha khoa (hoặc ngành Răng Hàm Mặt) là một ngành y học chuyên nghiên cứu, chẩn đoán, phòng ngừa và điều trị các bệnh lý liên quan đến răng, nướu, xương hàm và toàn bộ khoang miệng. Nha khoa còn bao gồm cả các phương pháp nâng cao sức khỏe răng miệng, phục hình thẩm mỹ và cải thiện chức năng ăn nhai.",
  },
  {
    specialtyName: "Tim mạch",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1759916093/medicare/b15bbaeeytwgo8huslon.png",
    description:
      "Tim mạch (tiếng Anh là Cardiology) là ngành y học chuyên về chẩn đoán, điều trị và phòng ngừa các bệnh lý liên quan đến tim và mạch máu. Ngành này bao gồm các chuyên khoa như nội tim mạch, ngoại tim mạch, thẩm mỹ tim và các vấn đề liên quan đến sức khỏe tim mạch.",
  },
  {
    specialtyName: "Thần kinh",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1759916149/medicare/yvwa13hxzhtahmnuxqo7.png",
    description:
      "Thần kinh (tiếng Anh là Neurology) là ngành y học chuyên về chẩn đoán, điều trị và phòng ngừa các bệnh lý liên quan đến hệ thần kinh. Ngành này bao gồm các chuyên khoa như nội thần kinh, ngoại thần kinh, thẩm mỹ thần kinh và các vấn đề liên quan đến sức khỏe thần kinh.",
  },
  {
    specialtyName: "Khoa mắt",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760339825/eye_clr3jv.png",
    description:
      "Khoa mắt (tiếng Anh là Ophthalmology) là ngành y học chuyên về chẩn đoán, điều trị và phòng ngừa các bệnh lý liên quan đến mắt. Ngành này bao gồm các chuyên khoa như nội mắt, ngoại mắt, thẩm mỹ mắt và các vấn đề liên quan đến sức khỏe mắt.",
  },
  {
    specialtyName: "Gan mật",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760340018/Liver_and_gallbladder_tabujp.png",
    description:
      "Gan mật (tiếng Anh là Hepatology) là ngành y học chuyên về chẩn đoán, điều trị và phòng ngừa các bệnh lý liên quan đến gan và mật. Ngành này bao gồm các chuyên khoa như nội gan mật, ngoại gan mật, thẩm mỹ gan mật và các vấn đề liên quan đến sức khỏe gan mật.",
  },
  {
    specialtyName: "Thận nội",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760340117/Nephrology_p3uye2.png",
    description:
      "Thận nội (tiếng Anh là Nephrology) là ngành y học chuyên về chẩn đoán, điều trị và phòng ngừa các bệnh lý liên quan đến thận. Ngành này bao gồm các chuyên khoa như nội thận, ngoại thận, thẩm mỹ thận và các vấn đề liên quan đến sức khỏe thận.",
  },
  {
    specialtyName: "Huyết học",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760340206/Hematology_yjrdjc.png",
    description:
      "Huyết học (tiếng Anh là Hematology) là ngành y học chuyên về chẩn đoán, điều trị và phòng ngừa các bệnh lý liên quan đến huyết học. Ngành này bao gồm các chuyên khoa như nội huyết học, ngoại huyết học, thẩm mỹ huyết học và các vấn đề liên quan đến sức khỏe huyết học.",
  },
  {
    specialtyName: "Cơ - xương - khớp",
    iconPath:
      "https://res.cloudinary.com/dwevfv0is/image/upload/v1760340300/Orthopedics_ytd8es.png",
    description:
      "Cơ - xương - khớp (tiếng Anh là Orthopedics) là ngành y học chuyên về chẩn đoán, điều trị và phòng ngừa các bệnh lý liên quan đến cơ - xương - khớp. Ngành này bao gồm các chuyên khoa như nội cơ - xương - khớp, ngoại cơ - xương - khớp, thẩm mỹ cơ - xương - khớp và các vấn đề liên quan đến sức khỏe cơ - xương - khớp.",
  },
];

const seedClinics = async () => {
  for (const item of CLINIC_SEEDS) {
    const existed = await prisma.clinic.findFirst({
      where: { clinicName: item.clinicName },
    });
    if (existed) continue;

    await prisma.clinic.create({
      data: {
        clinicName: item.clinicName,
        city: item.city as any,
        district: item.district,
        street: item.street,
        phone: item.phone,
        description: item.description,
        iconPath: item.iconPath,
        iconPublicId: "medicare",
      },
    });
  }
};

const seedSpecialties = async () => {
  for (const item of SPECIALTY_SEEDS) {
    const existed = await prisma.specialty.findFirst({
      where: { specialtyName: item.specialtyName },
    });
    if (existed) continue;

    await prisma.specialty.create({
      data: {
        specialtyName: item.specialtyName,
        iconPath: item.iconPath,
        iconPublicId: "medicare",
        description: item.description,
      },
    });
  }
};
const initDatabase = async () => {
  const countClinic = await prisma.clinic.count();
  const countSpecialty = await prisma.specialty.count();
  if (countClinic === 0) {
    await seedClinics();
    console.log("✓ Seed clinics completed");
  }
  if (countSpecialty === 0) {
    await seedSpecialties();
    console.log("✓ Seed specialties completed");
  }
};

export default initDatabase;
