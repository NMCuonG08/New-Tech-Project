import { AppDataSource } from "../data-source";
import { Location } from "../entities/Location";

const VIETNAM_PROVINCES = [
  { name: "Hà Nội", province: "Hà Nội", lat: 21.0285, lon: 105.8542, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hồ Chí Minh", province: "Hồ Chí Minh", lat: 10.8231, lon: 106.6297, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Đà Nẵng", province: "Đà Nẵng", lat: 16.0471, lon: 108.2068, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Hải Phòng", province: "Hải Phòng", lat: 20.8449, lon: 106.6881, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Cần Thơ", province: "Cần Thơ", lat: 10.0452, lon: 105.7469, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "An Giang", province: "An Giang", lat: 10.5216, lon: 105.1259, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bà Rịa - Vũng Tàu", province: "Bà Rịa - Vũng Tàu", lat: 10.3469, lon: 107.2423, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bạc Liêu", province: "Bạc Liêu", lat: 9.2941, lon: 105.7278, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bắc Giang", province: "Bắc Giang", lat: 21.2734, lon: 106.1947, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Bắc Kạn", province: "Bắc Kạn", lat: 22.1470, lon: 105.8342, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Bắc Ninh", province: "Bắc Ninh", lat: 21.1861, lon: 106.0763, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Bến Tre", province: "Bến Tre", lat: 10.2415, lon: 106.3759, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Định", province: "Bình Định", lat: 13.7755, lon: 109.2237, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Dương", province: "Bình Dương", lat: 11.3254, lon: 106.4774, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Phước", province: "Bình Phước", lat: 11.7508, lon: 106.7234, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Bình Thuận", province: "Bình Thuận", lat: 10.9376, lon: 108.0413, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Cà Mau", province: "Cà Mau", lat: 9.1774, lon: 105.1508, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Cao Bằng", province: "Cao Bằng", lat: 22.6657, lon: 106.2577, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Đắk Lắk", province: "Đắk Lắk", lat: 12.6662, lon: 108.0505, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Đắk Nông", province: "Đắk Nông", lat: 12.0046, lon: 107.6874, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Điện Biên", province: "Điện Biên", lat: 21.3852, lon: 103.0160, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Đồng Nai", province: "Đồng Nai", lat: 10.9574, lon: 106.8429, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Đồng Tháp", province: "Đồng Tháp", lat: 10.4930, lon: 105.7278, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Gia Lai", province: "Gia Lai", lat: 13.9838, lon: 108.0000, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Hà Giang", province: "Hà Giang", lat: 22.8233, lon: 104.9833, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hà Nam", province: "Hà Nam", lat: 20.5433, lon: 105.9228, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hà Tĩnh", province: "Hà Tĩnh", lat: 18.3428, lon: 105.9058, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hải Dương", province: "Hải Dương", lat: 20.9373, lon: 106.3146, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hậu Giang", province: "Hậu Giang", lat: 9.7844, lon: 105.4706, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Hòa Bình", province: "Hòa Bình", lat: 20.8133, lon: 105.3383, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Hưng Yên", province: "Hưng Yên", lat: 20.6464, lon: 106.0511, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Khánh Hòa", province: "Khánh Hòa", lat: 12.2388, lon: 109.1967, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Kiên Giang", province: "Kiên Giang", lat: 9.9583, lon: 105.0808, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Kon Tum", province: "Kon Tum", lat: 14.3545, lon: 108.0076, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Lai Châu", province: "Lai Châu", lat: 22.3864, lon: 103.4703, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Lâm Đồng", province: "Lâm Đồng", lat: 11.9404, lon: 108.4583, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Lạng Sơn", province: "Lạng Sơn", lat: 21.8536, lon: 106.7613, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Lào Cai", province: "Lào Cai", lat: 22.4856, lon: 103.9706, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Long An", province: "Long An", lat: 10.6086, lon: 106.6714, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Nam Định", province: "Nam Định", lat: 20.4208, lon: 106.1683, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Nghệ An", province: "Nghệ An", lat: 18.6796, lon: 105.6813, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Ninh Bình", province: "Ninh Bình", lat: 20.2537, lon: 105.9750, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Ninh Thuận", province: "Ninh Thuận", lat: 11.5643, lon: 108.9881, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Phú Thọ", province: "Phú Thọ", lat: 21.3081, lon: 105.3136, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Phú Yên", province: "Phú Yên", lat: 13.0883, lon: 109.3208, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Quảng Bình", province: "Quảng Bình", lat: 17.4683, lon: 106.6228, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Quảng Nam", province: "Quảng Nam", lat: 15.8801, lon: 108.3380, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Quảng Ngãi", province: "Quảng Ngãi", lat: 15.1167, lon: 108.8000, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Quảng Ninh", province: "Quảng Ninh", lat: 21.0064, lon: 107.2925, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Quảng Trị", province: "Quảng Trị", lat: 16.7500, lon: 107.2000, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Sóc Trăng", province: "Sóc Trăng", lat: 9.6025, lon: 105.9739, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Sơn La", province: "Sơn La", lat: 21.3257, lon: 103.9167, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Tây Ninh", province: "Tây Ninh", lat: 11.3131, lon: 106.0963, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Thái Bình", province: "Thái Bình", lat: 20.4461, lon: 106.3422, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Thái Nguyên", province: "Thái Nguyên", lat: 21.5942, lon: 105.8481, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Thanh Hóa", province: "Thanh Hóa", lat: 19.8067, lon: 105.7853, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Thừa Thiên Huế", province: "Thừa Thiên Huế", lat: 16.4637, lon: 107.5908, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Tiền Giang", province: "Tiền Giang", lat: 10.3600, lon: 106.3600, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Trà Vinh", province: "Trà Vinh", lat: 9.9347, lon: 106.3453, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Tuyên Quang", province: "Tuyên Quang", lat: 21.8233, lon: 105.2181, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Vĩnh Long", province: "Vĩnh Long", lat: 10.2537, lon: 105.9750, timezone: "Asia/Ho_Chi_Minh", countryCode: "VN" },
  { name: "Vĩnh Phúc", province: "Vĩnh Phúc", lat: 21.3081, lon: 105.5972, timezone: "Asia/Bangkok", countryCode: "VN" },
  { name: "Yên Bái", province: "Yên Bái", lat: 21.7051, lon: 104.8697, timezone: "Asia/Bangkok", countryCode: "VN" },
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
        latitude: province.lat,
        longitude: province.lon,
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

