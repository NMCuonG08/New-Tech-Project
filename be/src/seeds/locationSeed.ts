import { AppDataSource } from "../data-source";
import { Location } from "../entities/Location";

const VIETNAM_PROVINCES = [
  { name: "Hà Nội", province: "Hà Nội", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hồ Chí Minh", province: "Hồ Chí Minh", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Đà Nẵng", province: "Đà Nẵng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Hải Phòng", province: "Hải Phòng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Cần Thơ", province: "Cần Thơ", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "An Giang", province: "An Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bà Rịa - Vũng Tàu", province: "Bà Rịa - Vũng Tàu", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bạc Liêu", province: "Bạc Liêu", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bắc Giang", province: "Bắc Giang", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Bắc Kạn", province: "Bắc Kạn", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Bắc Ninh", province: "Bắc Ninh", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Bến Tre", province: "Bến Tre", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Định", province: "Bình Định", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Dương", province: "Bình Dương", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Phước", province: "Bình Phước", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Thuận", province: "Bình Thuận", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Cà Mau", province: "Cà Mau", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Cao Bằng", province: "Cao Bằng", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Đắk Lắk", province: "Đắk Lắk", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Đắk Nông", province: "Đắk Nông", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Điện Biên", province: "Điện Biên", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Đồng Nai", province: "Đồng Nai", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Đồng Tháp", province: "Đồng Tháp", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Gia Lai", province: "Gia Lai", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Hà Giang", province: "Hà Giang", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hà Nam", province: "Hà Nam", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hà Tĩnh", province: "Hà Tĩnh", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hải Dương", province: "Hải Dương", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hậu Giang", province: "Hậu Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Hòa Bình", province: "Hòa Bình", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hưng Yên", province: "Hưng Yên", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Khánh Hòa", province: "Khánh Hòa", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Kiên Giang", province: "Kiên Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Kon Tum", province: "Kon Tum", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Lai Châu", province: "Lai Châu", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Lâm Đồng", province: "Lâm Đồng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Lạng Sơn", province: "Lạng Sơn", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Lào Cai", province: "Lào Cai", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Long An", province: "Long An", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Nam Định", province: "Nam Định", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Nghệ An", province: "Nghệ An", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Ninh Bình", province: "Ninh Bình", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Ninh Thuận", province: "Ninh Thuận", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Phú Thọ", province: "Phú Thọ", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Phú Yên", province: "Phú Yên", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Quảng Bình", province: "Quảng Bình", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Quảng Nam", province: "Quảng Nam", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Quảng Ngãi", province: "Quảng Ngãi", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Quảng Ninh", province: "Quảng Ninh", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Quảng Trị", province: "Quảng Trị", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Sóc Trăng", province: "Sóc Trăng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Sơn La", province: "Sơn La", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Tây Ninh", province: "Tây Ninh", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Thái Bình", province: "Thái Bình", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Thái Nguyên", province: "Thái Nguyên", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Thanh Hóa", province: "Thanh Hóa", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Thừa Thiên Huế", province: "Thừa Thiên Huế", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Tiền Giang", province: "Tiền Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Trà Vinh", province: "Trà Vinh", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Tuyên Quang", province: "Tuyên Quang", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Vĩnh Long", province: "Vĩnh Long", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Vĩnh Phúc", province: "Vĩnh Phúc", timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Yên Bái", province: "Yên Bái", timezone: "Asia/Bangkok", countryCode: "VN" },
];

export async function seedLocations() {
  try {
    await AppDataSource.initialize();
    const locationRepository = AppDataSource.getRepository(Location);

    // Check if locations already exist
    const existingCount = await locationRepository.count();
    if (existingCount > 0) {
      console.log("Locations already seeded. Skipping...");
      return;
    }

    // Insert all provinces
    for (const province of VIETNAM_PROVINCES) {
      const location = locationRepository.create({
        name: province.name,
        province: province.province,
        timezone: province.timezone,
        countryCode: province.countryCode,
        images: [],
      });
      await locationRepository.save(location);
    }

    console.log(`✅ Successfully seeded ${VIETNAM_PROVINCES.length} provinces`);
  } catch (error) {
    console.error("Error seeding locations:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seed if this file is executed directly
seedLocations()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

