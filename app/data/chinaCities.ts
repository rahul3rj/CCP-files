/**
 * Major cities of China with coordinates.
 * Used for location autocomplete in Upload and for map pins in MapView.
 */
export type ChinaCity = {
  name: string;        // English name (also the canonical location key)
  nameCN?: string;     // Chinese name (for display)
  lat: number;
  lng: number;
  province?: string;   // Province / municipality / region
};

export const CHINA_CITIES: ChinaCity[] = [
  // Municipalities
  { name: "Beijing",      nameCN: "北京",   lat: 39.9042,  lng: 116.4074, province: "Beijing" },
  { name: "Shanghai",     nameCN: "上海",   lat: 31.2304,  lng: 121.4737, province: "Shanghai" },
  { name: "Tianjin",      nameCN: "天津",   lat: 39.3434,  lng: 117.3616, province: "Tianjin" },
  { name: "Chongqing",    nameCN: "重庆",   lat: 29.5630,  lng: 106.5516, province: "Chongqing" },

  // Guangdong
  { name: "Guangzhou",    nameCN: "广州",   lat: 23.1291,  lng: 113.2644, province: "Guangdong" },
  { name: "Shenzhen",     nameCN: "深圳",   lat: 22.5431,  lng: 114.0579, province: "Guangdong" },
  { name: "Dongguan",     nameCN: "东莞",   lat: 23.0207,  lng: 113.7518, province: "Guangdong" },
  { name: "Foshan",       nameCN: "佛山",   lat: 23.0219,  lng: 113.1219, province: "Guangdong" },
  { name: "Zhuhai",       nameCN: "珠海",   lat: 22.2708,  lng: 113.5767, province: "Guangdong" },
  { name: "Shantou",      nameCN: "汕头",   lat: 23.3541,  lng: 116.6820, province: "Guangdong" },

  // Special Administrative Regions
  { name: "Hong Kong",    nameCN: "香港",   lat: 22.3193,  lng: 114.1694, province: "HK SAR" },
  { name: "Macau",        nameCN: "澳门",   lat: 22.1987,  lng: 113.5439, province: "Macau SAR" },

  // Henan
  { name: "Zhengzhou",    nameCN: "郑州",   lat: 34.7473,  lng: 113.6249, province: "Henan" },
  { name: "Luoyang",      nameCN: "洛阳",   lat: 34.6197,  lng: 112.4539, province: "Henan" },
  { name: "Kaifeng",      nameCN: "开封",   lat: 34.7971,  lng: 114.3072, province: "Henan" },

  // Sichuan
  { name: "Chengdu",      nameCN: "成都",   lat: 30.5728,  lng: 104.0668, province: "Sichuan" },
  { name: "Mianyang",     nameCN: "绵阳",   lat: 31.4678,  lng: 104.6796, province: "Sichuan" },

  // Hubei
  { name: "Wuhan",        nameCN: "武汉",   lat: 30.5928,  lng: 114.3055, province: "Hubei" },
  { name: "Yichang",      nameCN: "宜昌",   lat: 30.6916,  lng: 111.2860, province: "Hubei" },

  // Liaoning
  { name: "Shenyang",     nameCN: "沈阳",   lat: 41.8057,  lng: 123.4315, province: "Liaoning" },
  { name: "Dalian",       nameCN: "大连",   lat: 38.9140,  lng: 121.6147, province: "Liaoning" },

  // Yunnan
  { name: "Kunming",      nameCN: "昆明",   lat: 25.0453,  lng: 102.7097, province: "Yunnan" },
  { name: "Dali",         nameCN: "大理",   lat: 25.6065,  lng: 100.2676, province: "Yunnan" },
  { name: "Lijiang",      nameCN: "丽江",   lat: 26.8721,  lng: 100.2280, province: "Yunnan" },

  // Xinjiang
  { name: "Urumqi",       nameCN: "乌鲁木齐", lat: 43.8256, lng: 87.6168,  province: "Xinjiang" },
  { name: "Kashgar",      nameCN: "喀什",   lat: 39.4704,  lng: 75.9895,  province: "Xinjiang" },

  // Tibet
  { name: "Lhasa",        nameCN: "拉萨",   lat: 29.6500,  lng: 91.1000,  province: "Tibet" },

  // Shaanxi
  { name: "Xi'an",        nameCN: "西安",   lat: 34.3416,  lng: 108.9398, province: "Shaanxi" },

  // Zhejiang
  { name: "Hangzhou",     nameCN: "杭州",   lat: 30.2741,  lng: 120.1551, province: "Zhejiang" },
  { name: "Ningbo",       nameCN: "宁波",   lat: 29.8683,  lng: 121.5440, province: "Zhejiang" },
  { name: "Wenzhou",      nameCN: "温州",   lat: 28.0005,  lng: 120.6724, province: "Zhejiang" },

  // Jiangsu
  { name: "Nanjing",      nameCN: "南京",   lat: 32.0603,  lng: 118.7969, province: "Jiangsu" },
  { name: "Suzhou",       nameCN: "苏州",   lat: 31.2990,  lng: 120.5853, province: "Jiangsu" },
  { name: "Wuxi",         nameCN: "无锡",   lat: 31.4912,  lng: 120.3119, province: "Jiangsu" },

  // Shandong
  { name: "Jinan",        nameCN: "济南",   lat: 36.6512,  lng: 117.1201, province: "Shandong" },
  { name: "Qingdao",      nameCN: "青岛",   lat: 36.0671,  lng: 120.3826, province: "Shandong" },

  // Hunan
  { name: "Changsha",     nameCN: "长沙",   lat: 28.2282,  lng: 112.9388, province: "Hunan" },

  // Anhui
  { name: "Hefei",        nameCN: "合肥",   lat: 31.8639,  lng: 117.2808, province: "Anhui" },

  // Fujian
  { name: "Fuzhou",       nameCN: "福州",   lat: 26.0745,  lng: 119.2965, province: "Fujian" },
  { name: "Xiamen",       nameCN: "厦门",   lat: 24.4798,  lng: 118.0894, province: "Fujian" },

  // Jiangxi
  { name: "Nanchang",     nameCN: "南昌",   lat: 28.6820,  lng: 115.8579, province: "Jiangxi" },

  // Guizhou
  { name: "Guiyang",      nameCN: "贵阳",   lat: 26.6470,  lng: 106.6302, province: "Guizhou" },

  // Guangxi
  { name: "Nanning",      nameCN: "南宁",   lat: 22.8170,  lng: 108.3665, province: "Guangxi" },

  // Hainan
  { name: "Haikou",       nameCN: "海口",   lat: 20.0442,  lng: 110.3419, province: "Hainan" },
  { name: "Sanya",        nameCN: "三亚",   lat: 18.2479,  lng: 109.5146, province: "Hainan" },

  // Gansu
  { name: "Lanzhou",      nameCN: "兰州",   lat: 36.0594,  lng: 103.7922, province: "Gansu" },

  // Inner Mongolia
  { name: "Hohhot",       nameCN: "呼和浩特", lat: 40.8426, lng: 111.7494, province: "Inner Mongolia" },

  // Heilongjiang
  { name: "Harbin",       nameCN: "哈尔滨", lat: 45.8038,  lng: 126.5349, province: "Heilongjiang" },

  // Jilin
  { name: "Changchun",    nameCN: "长春",   lat: 43.8171,  lng: 125.3235, province: "Jilin" },

  // Hebei
  { name: "Shijiazhuang", nameCN: "石家庄", lat: 38.0428,  lng: 114.5149, province: "Hebei" },

  // Shanxi
  { name: "Taiyuan",      nameCN: "太原",   lat: 37.8706,  lng: 112.5489, province: "Shanxi" },

  // Ningxia
  { name: "Yinchuan",     nameCN: "银川",   lat: 38.4872,  lng: 106.2309, province: "Ningxia" },

  // Qinghai
  { name: "Xining",       nameCN: "西宁",   lat: 36.6171,  lng: 101.7782, province: "Qinghai" },
];

/** Fuzzy-match cities for autocomplete. Returns up to `limit` results. */
export function suggestCities(query: string, limit = 8): ChinaCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CHINA_CITIES.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      (c.nameCN && c.nameCN.includes(q)) ||
      (c.province && c.province.toLowerCase().includes(q))
  ).slice(0, limit);
}

/** Find the best matching city for a location string (used by MapView). */
export function findCity(location: string): ChinaCity | undefined {
  const q = location.trim().toLowerCase();
  if (!q) return undefined;
  // Exact match first
  const exact = CHINA_CITIES.find(c => c.name.toLowerCase() === q || c.nameCN === location.trim());
  if (exact) return exact;
  // Partial match
  return CHINA_CITIES.find(
    c =>
      c.name.toLowerCase().includes(q) ||
      (c.nameCN && c.nameCN.includes(q)) ||
      q.includes(c.name.toLowerCase())
  );
}
