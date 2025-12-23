import { AppDataSource } from "../data-source";
import { Location } from "../entities/Location";

const VIETNAM_PROVINCES = [
  { name: "Hà Nội", province: "Hà Nội", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.0285, lon: 105.8542 },
  { name: "Hồ Chí Minh", province: "Hồ Chí Minh", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.8231, lon: 106.6297 },
  { name: "Đà Nẵng", province: "Đà Nẵng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 16.0544, lon: 108.2022 },
  { name: "Hải Phòng", province: "Hải Phòng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 20.8449, lon: 106.6881 },
  { name: "Cần Thơ", province: "Cần Thơ", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.0452, lon: 105.7469 },
  { name: "An Giang", province: "An Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.5392, lon: 105.1165 },
  { name: "Bà Rịa - Vũng Tàu", province: "Bà Rịa - Vũng Tàu", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.4963, lon: 107.1687 },
  { name: "Bạc Liêu", province: "Bạc Liêu", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 9.2941, lon: 105.7278 },
  { name: "Bắc Giang", province: "Bắc Giang", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.2731, lon: 106.1946 },
  { name: "Bắc Kạn", province: "Bắc Kạn", timezone: "Asia/Bangkok", countryCode: "VN", lat: 22.1470, lon: 105.8348 },
  { name: "Bắc Ninh", province: "Bắc Ninh", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.1861, lon: 106.0763 },
  { name: "Bến Tre", province: "Bến Tre", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.2798, lon: 106.3571 },
  { name: "Bình Định", province: "Bình Định", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 13.9416, lon: 109.0267 },
  { name: "Bình Dương", province: "Bình Dương", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 11.1611, lon: 106.6667 },
  { name: "Bình Phước", province: "Bình Phước", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 11.7511, lon: 106.9080 },
  { name: "Bình Thuận", province: "Bình Thuận", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 11.0894, lon: 108.0682 },
  { name: "Cà Mau", province: "Cà Mau", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 9.1769, lon: 105.1524 },
  { name: "Cao Bằng", province: "Cao Bằng", timezone: "Asia/Bangkok", countryCode: "VN", lat: 22.6565, lon: 106.2625 },
  { name: "Đắk Lắk", province: "Đắk Lắk", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 12.6667, lon: 108.0500 },
  { name: "Đắk Nông", province: "Đắk Nông", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 12.1834, lon: 107.6667 },
  { name: "Điện Biên", province: "Điện Biên", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.3833, lon: 103.0167 },
  { name: "Đồng Nai", province: "Đồng Nai", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 11.2334, lon: 107.3167 },
  { name: "Đồng Tháp", province: "Đồng Tháp", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.4667, lon: 105.6333 },
  { name: "Gia Lai", province: "Gia Lai", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 13.8167, lon: 108.2500 },
  { name: "Hà Giang", province: "Hà Giang", timezone: "Asia/Bangkok", countryCode: "VN", lat: 22.8167, lon: 104.9833 },
  { name: "Hà Nam", province: "Hà Nam", timezone: "Asia/Bangkok", countryCode: "VN", lat: 20.5333, lon: 105.9500 },
  { name: "Hà Tĩnh", province: "Hà Tĩnh", timezone: "Asia/Bangkok", countryCode: "VN", lat: 18.3333, lon: 105.9000 },
  { name: "Hải Dương", province: "Hải Dương", timezone: "Asia/Bangkok", countryCode: "VN", lat: 20.9333, lon: 106.3167 },
  { name: "Hậu Giang", province: "Hậu Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 9.7833, lon: 105.4667 },
  { name: "Hòa Bình", province: "Hòa Bình", timezone: "Asia/Bangkok", countryCode: "VN", lat: 20.8167, lon: 105.3333 },
  { name: "Hưng Yên", province: "Hưng Yên", timezone: "Asia/Bangkok", countryCode: "VN", lat: 20.6500, lon: 106.0500 },
  { name: "Khánh Hòa", province: "Khánh Hòa", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 12.2500, lon: 109.1833 },
  { name: "Kiên Giang", province: "Kiên Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.0167, lon: 105.0833 },
  { name: "Kon Tum", province: "Kon Tum", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 14.3500, lon: 108.0000 },
  { name: "Lai Châu", province: "Lai Châu", timezone: "Asia/Bangkok", countryCode: "VN", lat: 22.4000, lon: 103.4667 },
  { name: "Lâm Đồng", province: "Lâm Đồng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 11.5667, lon: 107.8000 },
  { name: "Lạng Sơn", province: "Lạng Sơn", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.8500, lon: 106.7667 },
  { name: "Lào Cai", province: "Lào Cai", timezone: "Asia/Bangkok", countryCode: "VN", lat: 22.4833, lon: 103.9667 },
  { name: "Long An", province: "Long An", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.5333, lon: 106.4000 },
  { name: "Nam Định", province: "Nam Định", timezone: "Asia/Bangkok", countryCode: "VN", lat: 20.4167, lon: 106.1667 },
  { name: "Nghệ An", province: "Nghệ An", timezone: "Asia/Bangkok", countryCode: "VN", lat: 19.3333, lon: 104.9167 },
  { name: "Ninh Bình", province: "Ninh Bình", timezone: "Asia/Bangkok", countryCode: "VN", lat: 20.2500, lon: 105.9667 },
  { name: "Ninh Thuận", province: "Ninh Thuận", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 11.5667, lon: 108.9833 },
  { name: "Phú Thọ", province: "Phú Thọ", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.3167, lon: 105.2167 },
  { name: "Phú Yên", province: "Phú Yên", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 13.0833, lon: 109.3000 },
  { name: "Quảng Bình", province: "Quảng Bình", timezone: "Asia/Bangkok", countryCode: "VN", lat: 17.4833, lon: 106.6000 },
  { name: "Quảng Nam", province: "Quảng Nam", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 15.5667, lon: 108.4667 },
  { name: "Quảng Ngãi", province: "Quảng Ngãi", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 15.1167, lon: 108.8000 },
  { name: "Quảng Ninh", province: "Quảng Ninh", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.0000, lon: 107.2000 },
  { name: "Quảng Trị", province: "Quảng Trị", timezone: "Asia/Bangkok", countryCode: "VN", lat: 16.8000, lon: 107.1000 },
  { name: "Sóc Trăng", province: "Sóc Trăng", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 9.6000, lon: 105.9667 },
  { name: "Sơn La", province: "Sơn La", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.3167, lon: 103.9000 },
  { name: "Tây Ninh", province: "Tây Ninh", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 11.3000, lon: 106.1000 },
  { name: "Thái Bình", province: "Thái Bình", timezone: "Asia/Bangkok", countryCode: "VN", lat: 20.4500, lon: 106.3333 },
  { name: "Thái Nguyên", province: "Thái Nguyên", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.5833, lon: 105.8333 },
  { name: "Thanh Hóa", province: "Thanh Hóa", timezone: "Asia/Bangkok", countryCode: "VN", lat: 19.8000, lon: 105.7667 },
  { name: "Thừa Thiên Huế", province: "Thừa Thiên Huế", timezone: "Asia/Bangkok", countryCode: "VN", lat: 16.4667, lon: 107.6000 },
  { name: "Tiền Giang", province: "Tiền Giang", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.4333, lon: 106.1667 },
  { name: "Trà Vinh", province: "Trà Vinh", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 9.9333, lon: 106.3333 },
  { name: "Tuyên Quang", province: "Tuyên Quang", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.8167, lon: 105.2167 },
  { name: "Vĩnh Long", province: "Vĩnh Long", timezone: "Asia/Ho_Chi_Minh", countryCode: "VN", lat: 10.2500, lon: 105.9667 },
  { name: "Vĩnh Phúc", province: "Vĩnh Phúc", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.3000, lon: 105.6000 },
  { name: "Yên Bái", province: "Yên Bái", timezone: "Asia/Bangkok", countryCode: "VN", lat: 21.7167, lon: 104.9000 },
];

export async function seedLocations() {
  try {
    await AppDataSource.initialize();
    const locationRepository = AppDataSource.getRepository(Location);

    console.log("Starting location seed...");

    for (const province of VIETNAM_PROVINCES) {
      const existingLocation = await locationRepository.findOne({
        where: { name: province.name }
      });

      if (existingLocation) {
        // Update coordinates if they are missing or different
        if (existingLocation.lat !== province.lat || existingLocation.lon !== province.lon) {
          existingLocation.lat = province.lat;
          existingLocation.lon = province.lon;
          existingLocation.province = province.province;
          await locationRepository.save(existingLocation);
          console.log(`Updated ${province.name} with hardcoded coords`);
        }
      } else {
        const location = locationRepository.create({
          name: province.name,
          province: province.province,
          timezone: province.timezone,
          countryCode: province.countryCode,
          lat: province.lat,
          lon: province.lon,
          images: [],
        });
        await locationRepository.save(location);
        console.log(`Created ${province.name}`);
      }
    }

    console.log(`✅ Seed completed: ${VIETNAM_PROVINCES.length} provinces processed.`);
  } catch (error) {
    console.error("Error seeding locations:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedLocations()
    .then(() => {
      console.log("Seed finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
