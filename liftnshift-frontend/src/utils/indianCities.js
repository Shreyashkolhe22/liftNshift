// ─── INDIAN CITIES DATABASE ──────────────────────────────────────────────────
// Each city has: name, state, latitude, longitude
// Covers all major & many tier-2/3 cities across India

const INDIAN_CITIES = [
  // Maharashtra
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781 },
  { name: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.7050, lng: 74.2433 },
  { name: "Amravati", state: "Maharashtra", lat: 20.9374, lng: 77.7796 },
  { name: "Navi Mumbai", state: "Maharashtra", lat: 19.0330, lng: 73.0297 },
  { name: "Sangli", state: "Maharashtra", lat: 16.8524, lng: 74.5815 },
  { name: "Jalgaon", state: "Maharashtra", lat: 21.0077, lng: 75.5626 },
  { name: "Akola", state: "Maharashtra", lat: 20.7002, lng: 77.0082 },
  { name: "Latur", state: "Maharashtra", lat: 18.3916, lng: 76.5604 },
  { name: "Dhule", state: "Maharashtra", lat: 20.9042, lng: 74.7749 },
  { name: "Ahmednagar", state: "Maharashtra", lat: 19.0948, lng: 74.7480 },
  { name: "Chandrapur", state: "Maharashtra", lat: 19.9615, lng: 79.2961 },
  { name: "Parbhani", state: "Maharashtra", lat: 19.2607, lng: 76.7748 },
  { name: "Nanded", state: "Maharashtra", lat: 19.1383, lng: 77.3210 },
  { name: "Satara", state: "Maharashtra", lat: 17.6805, lng: 74.0183 },
  { name: "Ratnagiri", state: "Maharashtra", lat: 16.9944, lng: 73.3000 },

  // Delhi NCR
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
  { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
  { name: "Greater Noida", state: "Uttar Pradesh", lat: 28.4744, lng: 77.5040 },

  // Karnataka
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Hubli", state: "Karnataka", lat: 15.3647, lng: 75.1240 },
  { name: "Mangaluru", state: "Karnataka", lat: 12.9141, lng: 74.8560 },
  { name: "Belgaum", state: "Karnataka", lat: 15.8497, lng: 74.4977 },
  { name: "Gulbarga", state: "Karnataka", lat: 17.3297, lng: 76.8343 },
  { name: "Davangere", state: "Karnataka", lat: 14.4644, lng: 75.9218 },
  { name: "Bellary", state: "Karnataka", lat: 15.1394, lng: 76.9214 },
  { name: "Shimoga", state: "Karnataka", lat: 13.9299, lng: 75.5681 },
  { name: "Tumkur", state: "Karnataka", lat: 13.3379, lng: 77.1173 },

  // Tamil Nadu
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460 },
  { name: "Tirunelveli", state: "Tamil Nadu", lat: 8.7139, lng: 77.7567 },
  { name: "Erode", state: "Tamil Nadu", lat: 11.3410, lng: 77.7172 },
  { name: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325 },
  { name: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411 },
  { name: "Thanjavur", state: "Tamil Nadu", lat: 10.7870, lng: 79.1378 },

  // Telangana
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Warangal", state: "Telangana", lat: 17.9784, lng: 79.5941 },
  { name: "Karimnagar", state: "Telangana", lat: 18.4386, lng: 79.1288 },
  { name: "Nizamabad", state: "Telangana", lat: 18.6727, lng: 78.0941 },
  { name: "Khammam", state: "Telangana", lat: 17.2473, lng: 80.1514 },
  { name: "Secunderabad", state: "Telangana", lat: 17.4399, lng: 78.4983 },

  // Andhra Pradesh
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
  { name: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365 },
  { name: "Nellore", state: "Andhra Pradesh", lat: 14.4426, lng: 79.9865 },
  { name: "Kurnool", state: "Andhra Pradesh", lat: 15.8281, lng: 78.0373 },
  { name: "Rajahmundry", state: "Andhra Pradesh", lat: 17.0005, lng: 81.8040 },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192 },
  { name: "Kakinada", state: "Andhra Pradesh", lat: 16.9891, lng: 82.2475 },
  { name: "Anantapur", state: "Andhra Pradesh", lat: 14.6819, lng: 77.6006 },

  // West Bengal
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Howrah", state: "West Bengal", lat: 22.5958, lng: 88.2636 },
  { name: "Durgapur", state: "West Bengal", lat: 23.5204, lng: 87.3119 },
  { name: "Asansol", state: "West Bengal", lat: 23.6739, lng: 86.9524 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953 },
  { name: "Kharagpur", state: "West Bengal", lat: 22.3460, lng: 87.2320 },
  { name: "Bardhaman", state: "West Bengal", lat: 23.2324, lng: 87.8615 },

  // Gujarat
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },
  { name: "Bhavnagar", state: "Gujarat", lat: 21.7645, lng: 72.1519 },
  { name: "Jamnagar", state: "Gujarat", lat: 22.4707, lng: 70.0577 },
  { name: "Junagadh", state: "Gujarat", lat: 21.5222, lng: 70.4579 },
  { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369 },
  { name: "Anand", state: "Gujarat", lat: 22.5645, lng: 72.9289 },
  { name: "Nadiad", state: "Gujarat", lat: 22.6916, lng: 72.8634 },
  { name: "Porbandar", state: "Gujarat", lat: 21.6417, lng: 69.6293 },
  { name: "Vapi", state: "Gujarat", lat: 20.3714, lng: 72.9044 },

  // Rajasthan
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
  { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399 },
  { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119 },
  { name: "Bhilwara", state: "Rajasthan", lat: 25.3470, lng: 74.6313 },
  { name: "Alwar", state: "Rajasthan", lat: 27.5530, lng: 76.6346 },
  { name: "Sikar", state: "Rajasthan", lat: 27.6094, lng: 75.1399 },
  { name: "Pali", state: "Rajasthan", lat: 25.7711, lng: 73.3234 },

  // Uttar Pradesh
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Allahabad", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064 },
  { name: "Bareilly", state: "Uttar Pradesh", lat: 28.3670, lng: 79.4304 },
  { name: "Aligarh", state: "Uttar Pradesh", lat: 27.8974, lng: 78.0880 },
  { name: "Moradabad", state: "Uttar Pradesh", lat: 28.8386, lng: 78.7733 },
  { name: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732 },
  { name: "Saharanpur", state: "Uttar Pradesh", lat: 29.9680, lng: 77.5510 },
  { name: "Jhansi", state: "Uttar Pradesh", lat: 25.4484, lng: 78.5685 },
  { name: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lng: 77.6737 },
  { name: "Firozabad", state: "Uttar Pradesh", lat: 27.1591, lng: 78.3957 },
  { name: "Ayodhya", state: "Uttar Pradesh", lat: 26.7922, lng: 82.1998 },

  // Madhya Pradesh
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
  { name: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lng: 75.7885 },
  { name: "Sagar", state: "Madhya Pradesh", lat: 23.8388, lng: 78.7378 },
  { name: "Dewas", state: "Madhya Pradesh", lat: 22.9623, lng: 76.0508 },
  { name: "Satna", state: "Madhya Pradesh", lat: 24.5004, lng: 80.8322 },
  { name: "Ratlam", state: "Madhya Pradesh", lat: 23.3315, lng: 75.0367 },
  { name: "Rewa", state: "Madhya Pradesh", lat: 24.5373, lng: 81.3042 },

  // Bihar
  { name: "Patna", state: "Bihar", lat: 25.6093, lng: 85.1376 },
  { name: "Gaya", state: "Bihar", lat: 24.7955, lng: 85.0002 },
  { name: "Bhagalpur", state: "Bihar", lat: 25.2425, lng: 87.0079 },
  { name: "Muzaffarpur", state: "Bihar", lat: 26.1209, lng: 85.3647 },
  { name: "Purnia", state: "Bihar", lat: 25.7771, lng: 87.4753 },
  { name: "Darbhanga", state: "Bihar", lat: 26.1542, lng: 85.8918 },
  { name: "Arrah", state: "Bihar", lat: 25.5541, lng: 84.6639 },

  // Punjab
  { name: "Ludhiana", state: "Punjab", lat: 30.9000, lng: 75.8573 },
  { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723 },
  { name: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762 },
  { name: "Patiala", state: "Punjab", lat: 30.3398, lng: 76.3869 },
  { name: "Bathinda", state: "Punjab", lat: 30.2104, lng: 74.9455 },
  { name: "Mohali", state: "Punjab", lat: 30.7046, lng: 76.7179 },
  { name: "Pathankot", state: "Punjab", lat: 32.2643, lng: 75.6421 },

  // Haryana
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Ambala", state: "Haryana", lat: 30.3782, lng: 76.7767 },
  { name: "Panipat", state: "Haryana", lat: 29.3909, lng: 76.9635 },
  { name: "Karnal", state: "Haryana", lat: 29.6857, lng: 76.9905 },
  { name: "Hisar", state: "Haryana", lat: 29.1492, lng: 75.7217 },
  { name: "Sonipat", state: "Haryana", lat: 28.9931, lng: 77.0151 },
  { name: "Rohtak", state: "Haryana", lat: 28.8955, lng: 76.6066 },
  { name: "Kurukshetra", state: "Haryana", lat: 29.9695, lng: 76.8783 },

  // Kerala
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804 },
  { name: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144 },
  { name: "Kollam", state: "Kerala", lat: 8.8932, lng: 76.6141 },
  { name: "Palakkad", state: "Kerala", lat: 10.7867, lng: 76.6548 },
  { name: "Kannur", state: "Kerala", lat: 11.8745, lng: 75.3704 },
  { name: "Alappuzha", state: "Kerala", lat: 9.4981, lng: 76.3388 },
  { name: "Malappuram", state: "Kerala", lat: 11.0510, lng: 76.0711 },

  // Odisha
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { name: "Cuttack", state: "Odisha", lat: 20.4625, lng: 85.8830 },
  { name: "Rourkela", state: "Odisha", lat: 22.2604, lng: 84.8536 },
  { name: "Berhampur", state: "Odisha", lat: 19.3149, lng: 84.7941 },
  { name: "Sambalpur", state: "Odisha", lat: 21.4669, lng: 83.9812 },
  { name: "Puri", state: "Odisha", lat: 19.7983, lng: 85.8249 },

  // Jharkhand
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029 },
  { name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304 },
  { name: "Bokaro", state: "Jharkhand", lat: 23.6693, lng: 86.1511 },
  { name: "Hazaribagh", state: "Jharkhand", lat: 23.9966, lng: 85.3637 },
  { name: "Deoghar", state: "Jharkhand", lat: 24.4764, lng: 86.6932 },

  // Chhattisgarh
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Bhilai", state: "Chhattisgarh", lat: 21.2094, lng: 81.3784 },
  { name: "Bilaspur", state: "Chhattisgarh", lat: 22.0796, lng: 82.1391 },
  { name: "Korba", state: "Chhattisgarh", lat: 22.3595, lng: 82.7501 },
  { name: "Durg", state: "Chhattisgarh", lat: 21.1904, lng: 81.2849 },

  // Assam
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Silchar", state: "Assam", lat: 24.8333, lng: 92.7789 },
  { name: "Dibrugarh", state: "Assam", lat: 27.4728, lng: 94.9120 },
  { name: "Jorhat", state: "Assam", lat: 26.7509, lng: 94.2037 },
  { name: "Tezpur", state: "Assam", lat: 26.6528, lng: 92.7926 },

  // Uttarakhand
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642 },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { name: "Haldwani", state: "Uttarakhand", lat: 29.2183, lng: 79.5130 },
  { name: "Roorkee", state: "Uttarakhand", lat: 29.8543, lng: 77.8880 },
  { name: "Nainital", state: "Uttarakhand", lat: 29.3803, lng: 79.4636 },

  // Himachal Pradesh
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Dharamshala", state: "Himachal Pradesh", lat: 32.2190, lng: 76.3234 },
  { name: "Mandi", state: "Himachal Pradesh", lat: 31.7088, lng: 76.9317 },
  { name: "Solan", state: "Himachal Pradesh", lat: 30.9045, lng: 77.0967 },
  { name: "Kullu", state: "Himachal Pradesh", lat: 31.9579, lng: 77.1095 },
  { name: "Manali", state: "Himachal Pradesh", lat: 32.2432, lng: 77.1892 },

  // Jammu & Kashmir
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.8570 },

  // Goa
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278 },
  { name: "Margao", state: "Goa", lat: 15.2832, lng: 73.9862 },
  { name: "Vasco da Gama", state: "Goa", lat: 15.3982, lng: 73.8113 },
  { name: "Mapusa", state: "Goa", lat: 15.5922, lng: 73.8087 },

  // Northeast
  { name: "Imphal", state: "Manipur", lat: 24.8170, lng: 93.9368 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933 },
  { name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176 },
  { name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868 },
  { name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.1086 },
  { name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3389, lng: 88.6065 },

  // Union Territories & Others
  { name: "Pondicherry", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  { name: "Puducherry", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  { name: "Port Blair", state: "Andaman & Nicobar", lat: 11.6234, lng: 92.7265 },
  { name: "Daman", state: "Dadra & Nagar Haveli", lat: 20.3974, lng: 72.8328 },
  { name: "Silvassa", state: "Dadra & Nagar Haveli", lat: 20.2766, lng: 73.0153 },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771 },
  { name: "Kargil", state: "Ladakh", lat: 34.5539, lng: 76.1349 },

  // ── Maharashtra – Smaller Towns ──
  { name: "Daryapur", state: "Maharashtra", lat: 20.9267, lng: 77.3267 },
  { name: "Lasur", state: "Maharashtra", lat: 19.8833, lng: 75.2667 },
  { name: "Yeola", state: "Maharashtra", lat: 20.0417, lng: 74.4833 },
  { name: "Beed", state: "Maharashtra", lat: 18.9893, lng: 75.7601 },
  { name: "Osmanabad", state: "Maharashtra", lat: 18.1860, lng: 76.0444 },
  { name: "Hingoli", state: "Maharashtra", lat: 19.7167, lng: 77.1500 },
  { name: "Washim", state: "Maharashtra", lat: 20.1073, lng: 77.1068 },
  { name: "Buldhana", state: "Maharashtra", lat: 20.5293, lng: 76.1847 },
  { name: "Yavatmal", state: "Maharashtra", lat: 20.3888, lng: 78.1204 },
  { name: "Wardha", state: "Maharashtra", lat: 20.7453, lng: 78.6022 },
  { name: "Gondia", state: "Maharashtra", lat: 21.4545, lng: 80.1950 },
  { name: "Bhandara", state: "Maharashtra", lat: 21.1669, lng: 79.6500 },
  { name: "Gadchiroli", state: "Maharashtra", lat: 20.1833, lng: 80.0000 },
  { name: "Sindhudurg", state: "Maharashtra", lat: 16.3483, lng: 73.7580 },
  { name: "Baramati", state: "Maharashtra", lat: 18.1520, lng: 74.5772 },
  { name: "Shirdi", state: "Maharashtra", lat: 19.7662, lng: 74.4756 },
  { name: "Pandharpur", state: "Maharashtra", lat: 17.6819, lng: 75.3309 },
  { name: "Ichalkaranji", state: "Maharashtra", lat: 16.6906, lng: 74.4609 },
  { name: "Malegaon", state: "Maharashtra", lat: 20.5548, lng: 74.5193 },
  { name: "Kalyan", state: "Maharashtra", lat: 19.2437, lng: 73.1355 },
  { name: "Dombivli", state: "Maharashtra", lat: 19.2183, lng: 73.0867 },
  { name: "Bhiwandi", state: "Maharashtra", lat: 19.2813, lng: 73.0483 },
  { name: "Vasai", state: "Maharashtra", lat: 19.3919, lng: 72.8397 },
  { name: "Virar", state: "Maharashtra", lat: 19.4559, lng: 72.8113 },
  { name: "Panvel", state: "Maharashtra", lat: 18.9894, lng: 73.1175 },
  { name: "Ambernath", state: "Maharashtra", lat: 19.1860, lng: 73.1848 },
  { name: "Ulhasnagar", state: "Maharashtra", lat: 19.2215, lng: 73.1645 },
  { name: "Pimpri-Chinchwad", state: "Maharashtra", lat: 18.6298, lng: 73.7997 },
  { name: "Lonavala", state: "Maharashtra", lat: 18.7546, lng: 73.4062 },
  { name: "Chiplun", state: "Maharashtra", lat: 17.5305, lng: 73.5097 },
  { name: "Sawantwadi", state: "Maharashtra", lat: 15.9039, lng: 73.8164 },
  { name: "Udgir", state: "Maharashtra", lat: 18.3927, lng: 77.1162 },
  { name: "Barshi", state: "Maharashtra", lat: 18.2345, lng: 75.6928 },
  { name: "Pathri", state: "Maharashtra", lat: 19.2614, lng: 76.4503 },
  { name: "Amalner", state: "Maharashtra", lat: 21.0425, lng: 75.0578 },
  { name: "Chopda", state: "Maharashtra", lat: 21.2500, lng: 75.3000 },
  { name: "Shrirampur", state: "Maharashtra", lat: 19.6167, lng: 74.6500 },
  { name: "Murtizapur", state: "Maharashtra", lat: 20.7333, lng: 77.3500 },
  { name: "Achalpur", state: "Maharashtra", lat: 21.2588, lng: 77.5100 },
  { name: "Chikhli", state: "Maharashtra", lat: 20.3500, lng: 76.2500 },
  { name: "Khamgaon", state: "Maharashtra", lat: 20.7000, lng: 76.5667 },
  { name: "Shegaon", state: "Maharashtra", lat: 20.7900, lng: 76.6900 },
  { name: "Manjlegaon", state: "Maharashtra", lat: 19.1500, lng: 76.5333 },
  { name: "Jintur", state: "Maharashtra", lat: 19.6114, lng: 76.6856 },

  // ── Uttar Pradesh – Smaller Towns ──
  { name: "Sultanpur", state: "Uttar Pradesh", lat: 26.2648, lng: 82.0727 },
  { name: "Azamgarh", state: "Uttar Pradesh", lat: 26.0735, lng: 83.1857 },
  { name: "Basti", state: "Uttar Pradesh", lat: 26.7929, lng: 82.7463 },
  { name: "Deoria", state: "Uttar Pradesh", lat: 26.5024, lng: 83.7791 },
  { name: "Ballia", state: "Uttar Pradesh", lat: 25.7587, lng: 84.1489 },
  { name: "Jaunpur", state: "Uttar Pradesh", lat: 25.7464, lng: 82.6837 },
  { name: "Mirzapur", state: "Uttar Pradesh", lat: 25.1337, lng: 82.5644 },
  { name: "Sonbhadra", state: "Uttar Pradesh", lat: 24.6829, lng: 83.0639 },
  { name: "Banda", state: "Uttar Pradesh", lat: 25.4760, lng: 80.3400 },
  { name: "Hamirpur", state: "Uttar Pradesh", lat: 25.9544, lng: 80.1514 },
  { name: "Fatehpur", state: "Uttar Pradesh", lat: 25.9304, lng: 80.8139 },
  { name: "Pratapgarh", state: "Uttar Pradesh", lat: 25.8985, lng: 81.9401 },
  { name: "Rae Bareli", state: "Uttar Pradesh", lat: 26.2173, lng: 81.2320 },
  { name: "Unnao", state: "Uttar Pradesh", lat: 26.5393, lng: 80.4880 },
  { name: "Hardoi", state: "Uttar Pradesh", lat: 27.3953, lng: 80.1312 },
  { name: "Sitapur", state: "Uttar Pradesh", lat: 27.5735, lng: 80.6828 },
  { name: "Lakhimpur Kheri", state: "Uttar Pradesh", lat: 27.9462, lng: 80.7721 },
  { name: "Shahjahanpur", state: "Uttar Pradesh", lat: 27.8830, lng: 79.9120 },
  { name: "Pilibhit", state: "Uttar Pradesh", lat: 28.6380, lng: 79.8040 },
  { name: "Rampur", state: "Uttar Pradesh", lat: 28.8109, lng: 79.0260 },
  { name: "Budaun", state: "Uttar Pradesh", lat: 28.0500, lng: 79.1200 },
  { name: "Etawah", state: "Uttar Pradesh", lat: 26.7854, lng: 79.0208 },
  { name: "Mainpuri", state: "Uttar Pradesh", lat: 27.2360, lng: 79.0220 },
  { name: "Etah", state: "Uttar Pradesh", lat: 27.5571, lng: 78.6682 },
  { name: "Hathras", state: "Uttar Pradesh", lat: 27.5963, lng: 78.0519 },
  { name: "Kasganj", state: "Uttar Pradesh", lat: 27.8072, lng: 78.6468 },
  { name: "Sambhal", state: "Uttar Pradesh", lat: 28.5840, lng: 78.5700 },
  { name: "Amroha", state: "Uttar Pradesh", lat: 28.9044, lng: 78.4667 },
  { name: "Muzaffarnagar", state: "Uttar Pradesh", lat: 29.4727, lng: 77.7085 },
  { name: "Shamli", state: "Uttar Pradesh", lat: 29.4489, lng: 77.3070 },
  { name: "Baghpat", state: "Uttar Pradesh", lat: 28.9455, lng: 77.2210 },
  { name: "Bulandshahr", state: "Uttar Pradesh", lat: 28.4070, lng: 77.8498 },
  { name: "Hapur", state: "Uttar Pradesh", lat: 28.7306, lng: 77.7759 },
  { name: "Bijnor", state: "Uttar Pradesh", lat: 29.3724, lng: 78.1361 },
  { name: "Orai", state: "Uttar Pradesh", lat: 25.9920, lng: 79.4536 },
  { name: "Lalitpur", state: "Uttar Pradesh", lat: 24.6880, lng: 78.4148 },
  { name: "Mahoba", state: "Uttar Pradesh", lat: 25.2876, lng: 79.8717 },
  { name: "Chitrakoot", state: "Uttar Pradesh", lat: 25.2036, lng: 80.8547 },
  { name: "Vrindavan", state: "Uttar Pradesh", lat: 27.5818, lng: 77.6967 },

  // ── Madhya Pradesh – Smaller Towns ──
  { name: "Vidisha", state: "Madhya Pradesh", lat: 23.5251, lng: 77.8081 },
  { name: "Chhindwara", state: "Madhya Pradesh", lat: 22.0574, lng: 78.9382 },
  { name: "Hoshangabad", state: "Madhya Pradesh", lat: 22.7459, lng: 77.7289 },
  { name: "Betul", state: "Madhya Pradesh", lat: 21.9026, lng: 77.8974 },
  { name: "Khandwa", state: "Madhya Pradesh", lat: 21.8243, lng: 76.3527 },
  { name: "Burhanpur", state: "Madhya Pradesh", lat: 21.3100, lng: 76.2300 },
  { name: "Morena", state: "Madhya Pradesh", lat: 26.4940, lng: 77.9930 },
  { name: "Shivpuri", state: "Madhya Pradesh", lat: 25.4237, lng: 77.6570 },
  { name: "Damoh", state: "Madhya Pradesh", lat: 23.8333, lng: 79.4500 },
  { name: "Seoni", state: "Madhya Pradesh", lat: 22.0850, lng: 79.5350 },
  { name: "Narsinghpur", state: "Madhya Pradesh", lat: 22.9500, lng: 79.2000 },
  { name: "Mandla", state: "Madhya Pradesh", lat: 22.5990, lng: 80.3731 },
  { name: "Shahdol", state: "Madhya Pradesh", lat: 23.2972, lng: 81.3589 },
  { name: "Neemuch", state: "Madhya Pradesh", lat: 24.4710, lng: 74.8670 },
  { name: "Mandsaur", state: "Madhya Pradesh", lat: 24.0718, lng: 75.0694 },
  { name: "Khargone", state: "Madhya Pradesh", lat: 21.8230, lng: 75.6150 },
  { name: "Datia", state: "Madhya Pradesh", lat: 25.6722, lng: 78.4611 },
  { name: "Tikamgarh", state: "Madhya Pradesh", lat: 24.7470, lng: 78.8300 },
  { name: "Chhatarpur", state: "Madhya Pradesh", lat: 24.9122, lng: 79.5893 },
  { name: "Panna", state: "Madhya Pradesh", lat: 24.7244, lng: 80.1800 },

  // ── Gujarat – Smaller Towns ──
  { name: "Surendranagar", state: "Gujarat", lat: 22.7289, lng: 71.6363 },
  { name: "Mehsana", state: "Gujarat", lat: 23.5880, lng: 72.3693 },
  { name: "Palanpur", state: "Gujarat", lat: 24.1725, lng: 72.4341 },
  { name: "Bharuch", state: "Gujarat", lat: 21.7051, lng: 72.9959 },
  { name: "Navsari", state: "Gujarat", lat: 20.9467, lng: 72.9520 },
  { name: "Veraval", state: "Gujarat", lat: 20.9032, lng: 70.3677 },
  { name: "Gondal", state: "Gujarat", lat: 21.9610, lng: 70.7959 },
  { name: "Morbi", state: "Gujarat", lat: 22.8173, lng: 70.8370 },
  { name: "Dahod", state: "Gujarat", lat: 22.8394, lng: 74.2552 },
  { name: "Godhra", state: "Gujarat", lat: 22.7788, lng: 73.6143 },
  { name: "Botad", state: "Gujarat", lat: 22.1691, lng: 71.6689 },
  { name: "Amreli", state: "Gujarat", lat: 21.5990, lng: 71.2200 },
  { name: "Patan", state: "Gujarat", lat: 23.8500, lng: 72.1260 },
  { name: "Dwarka", state: "Gujarat", lat: 22.2394, lng: 68.9678 },
  { name: "Somnath", state: "Gujarat", lat: 20.8880, lng: 70.4017 },
  { name: "Kutch", state: "Gujarat", lat: 23.7337, lng: 69.8597 },
  { name: "Bhuj", state: "Gujarat", lat: 23.2420, lng: 69.6669 },
  { name: "Gandhidham", state: "Gujarat", lat: 23.0753, lng: 70.1337 },
  { name: "Mundra", state: "Gujarat", lat: 22.8394, lng: 69.7217 },

  // ── Rajasthan – Smaller Towns ──
  { name: "Jhunjhunu", state: "Rajasthan", lat: 28.1290, lng: 75.3980 },
  { name: "Churu", state: "Rajasthan", lat: 28.3078, lng: 74.9681 },
  { name: "Sri Ganganagar", state: "Rajasthan", lat: 29.9038, lng: 73.8772 },
  { name: "Hanumangarh", state: "Rajasthan", lat: 29.5883, lng: 74.3297 },
  { name: "Nagaur", state: "Rajasthan", lat: 27.2024, lng: 73.7350 },
  { name: "Barmer", state: "Rajasthan", lat: 25.7537, lng: 71.3926 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083 },
  { name: "Tonk", state: "Rajasthan", lat: 26.1547, lng: 75.7863 },
  { name: "Bundi", state: "Rajasthan", lat: 25.4305, lng: 75.6499 },
  { name: "Sawai Madhopur", state: "Rajasthan", lat: 26.0173, lng: 76.3464 },
  { name: "Karauli", state: "Rajasthan", lat: 26.4955, lng: 77.0240 },
  { name: "Dholpur", state: "Rajasthan", lat: 26.7088, lng: 77.8909 },
  { name: "Baran", state: "Rajasthan", lat: 25.1000, lng: 76.5120 },
  { name: "Jhalawar", state: "Rajasthan", lat: 24.5975, lng: 76.1663 },
  { name: "Pratapgarh", state: "Rajasthan", lat: 24.0375, lng: 74.7780 },
  { name: "Dungarpur", state: "Rajasthan", lat: 23.8437, lng: 73.7143 },
  { name: "Banswara", state: "Rajasthan", lat: 23.5463, lng: 74.4425 },
  { name: "Rajsamand", state: "Rajasthan", lat: 25.0700, lng: 73.8764 },
  { name: "Chittorgarh", state: "Rajasthan", lat: 24.8887, lng: 74.6269 },
  { name: "Mount Abu", state: "Rajasthan", lat: 24.5926, lng: 72.7156 },
  { name: "Pushkar", state: "Rajasthan", lat: 26.4900, lng: 74.5513 },
  { name: "Nathdwara", state: "Rajasthan", lat: 24.9380, lng: 73.8220 },
  { name: "Beawar", state: "Rajasthan", lat: 26.1012, lng: 74.3189 },
  { name: "Kishangarh", state: "Rajasthan", lat: 26.5849, lng: 74.8550 },

  // ── Bihar – Smaller Towns ──
  { name: "Buxar", state: "Bihar", lat: 25.5764, lng: 83.9785 },
  { name: "Chhapra", state: "Bihar", lat: 25.7804, lng: 84.7500 },
  { name: "Siwan", state: "Bihar", lat: 26.2218, lng: 84.3567 },
  { name: "Gopalganj", state: "Bihar", lat: 26.4687, lng: 84.4378 },
  { name: "Motihari", state: "Bihar", lat: 26.6557, lng: 84.9167 },
  { name: "Bettiah", state: "Bihar", lat: 26.8030, lng: 84.5120 },
  { name: "Hajipur", state: "Bihar", lat: 25.6857, lng: 85.2102 },
  { name: "Samastipur", state: "Bihar", lat: 25.8628, lng: 85.7817 },
  { name: "Begusarai", state: "Bihar", lat: 25.4182, lng: 86.1272 },
  { name: "Munger", state: "Bihar", lat: 25.3708, lng: 86.4735 },
  { name: "Katihar", state: "Bihar", lat: 25.5390, lng: 87.5719 },
  { name: "Madhubani", state: "Bihar", lat: 26.3540, lng: 86.0718 },
  { name: "Kishanganj", state: "Bihar", lat: 26.0927, lng: 87.9395 },
  { name: "Nawada", state: "Bihar", lat: 24.8861, lng: 85.5408 },
  { name: "Jehanabad", state: "Bihar", lat: 25.2128, lng: 84.9880 },
  { name: "Aurangabad", state: "Bihar", lat: 24.7536, lng: 84.3742 },
  { name: "Sasaram", state: "Bihar", lat: 24.9528, lng: 84.0310 },

  // ── Karnataka – Smaller Towns ──
  { name: "Bidar", state: "Karnataka", lat: 17.9133, lng: 77.5301 },
  { name: "Raichur", state: "Karnataka", lat: 16.2076, lng: 77.3463 },
  { name: "Bagalkot", state: "Karnataka", lat: 16.1691, lng: 75.6615 },
  { name: "Gadag", state: "Karnataka", lat: 15.4320, lng: 75.6260 },
  { name: "Haveri", state: "Karnataka", lat: 14.7952, lng: 75.4036 },
  { name: "Dharwad", state: "Karnataka", lat: 15.4589, lng: 75.0078 },
  { name: "Udupi", state: "Karnataka", lat: 13.3409, lng: 74.7421 },
  { name: "Chikmagalur", state: "Karnataka", lat: 13.3153, lng: 75.7754 },
  { name: "Hassan", state: "Karnataka", lat: 13.0072, lng: 76.0962 },
  { name: "Mandya", state: "Karnataka", lat: 12.5218, lng: 76.8952 },
  { name: "Kolar", state: "Karnataka", lat: 13.1368, lng: 78.1290 },
  { name: "Chikballapur", state: "Karnataka", lat: 13.4349, lng: 77.7270 },
  { name: "Karwar", state: "Karnataka", lat: 14.8124, lng: 74.1299 },
  { name: "Koppal", state: "Karnataka", lat: 15.3470, lng: 76.1549 },
  { name: "Yadgir", state: "Karnataka", lat: 16.7700, lng: 77.1380 },
  { name: "Chitradurga", state: "Karnataka", lat: 14.2226, lng: 76.3987 },
  { name: "Hospet", state: "Karnataka", lat: 15.2689, lng: 76.3909 },

  // ── Tamil Nadu – Smaller Towns ──
  { name: "Dindigul", state: "Tamil Nadu", lat: 10.3624, lng: 77.9695 },
  { name: "Karur", state: "Tamil Nadu", lat: 10.9601, lng: 78.0766 },
  { name: "Namakkal", state: "Tamil Nadu", lat: 11.2189, lng: 78.1674 },
  { name: "Krishnagiri", state: "Tamil Nadu", lat: 12.5186, lng: 78.2137 },
  { name: "Dharmapuri", state: "Tamil Nadu", lat: 12.1211, lng: 78.1582 },
  { name: "Perambalur", state: "Tamil Nadu", lat: 11.2340, lng: 78.8800 },
  { name: "Ariyalur", state: "Tamil Nadu", lat: 11.1400, lng: 79.0785 },
  { name: "Cuddalore", state: "Tamil Nadu", lat: 11.7480, lng: 79.7714 },
  { name: "Nagapattinam", state: "Tamil Nadu", lat: 10.7657, lng: 79.8424 },
  { name: "Ramanathapuram", state: "Tamil Nadu", lat: 9.3639, lng: 78.8395 },
  { name: "Sivaganga", state: "Tamil Nadu", lat: 10.0069, lng: 78.4841 },
  { name: "Virudhunagar", state: "Tamil Nadu", lat: 9.5852, lng: 77.9528 },
  { name: "Thoothukudi", state: "Tamil Nadu", lat: 8.7642, lng: 78.1348 },
  { name: "Kanyakumari", state: "Tamil Nadu", lat: 8.0883, lng: 77.5385 },
  { name: "Nagercoil", state: "Tamil Nadu", lat: 8.1833, lng: 77.4119 },
  { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.6950 },
  { name: "Kodaikanal", state: "Tamil Nadu", lat: 10.2381, lng: 77.4892 },
  { name: "Kumbakonam", state: "Tamil Nadu", lat: 10.9617, lng: 79.3881 },
  { name: "Mayiladuthurai", state: "Tamil Nadu", lat: 11.1014, lng: 79.6583 },
  { name: "Kanchipuram", state: "Tamil Nadu", lat: 12.8342, lng: 79.7036 },

  // ── Telangana – Smaller Towns ──
  { name: "Mahabubnagar", state: "Telangana", lat: 16.7370, lng: 78.0028 },
  { name: "Nalgonda", state: "Telangana", lat: 17.0575, lng: 79.2676 },
  { name: "Adilabad", state: "Telangana", lat: 19.6641, lng: 78.5320 },
  { name: "Siddipet", state: "Telangana", lat: 18.1019, lng: 78.8529 },
  { name: "Mancherial", state: "Telangana", lat: 18.8679, lng: 79.4434 },
  { name: "Kamareddy", state: "Telangana", lat: 18.3240, lng: 78.3430 },
  { name: "Suryapet", state: "Telangana", lat: 17.1400, lng: 79.6300 },
  { name: "Zaheerabad", state: "Telangana", lat: 17.6816, lng: 77.6076 },
  { name: "Sangareddy", state: "Telangana", lat: 17.6193, lng: 78.0900 },
  { name: "Bodhan", state: "Telangana", lat: 18.6647, lng: 77.8953 },

  // ── Andhra Pradesh – Smaller Towns ──
  { name: "Ongole", state: "Andhra Pradesh", lat: 15.5057, lng: 80.0499 },
  { name: "Eluru", state: "Andhra Pradesh", lat: 16.7107, lng: 81.0952 },
  { name: "Srikakulam", state: "Andhra Pradesh", lat: 18.2949, lng: 83.8938 },
  { name: "Vizianagaram", state: "Andhra Pradesh", lat: 18.1066, lng: 83.3956 },
  { name: "Proddatur", state: "Andhra Pradesh", lat: 14.7502, lng: 78.5481 },
  { name: "Nandyal", state: "Andhra Pradesh", lat: 15.4780, lng: 78.4836 },
  { name: "Tadepalligudem", state: "Andhra Pradesh", lat: 16.8143, lng: 81.5269 },
  { name: "Machilipatnam", state: "Andhra Pradesh", lat: 16.1876, lng: 81.1390 },
  { name: "Tenali", state: "Andhra Pradesh", lat: 16.2439, lng: 80.6400 },
  { name: "Chittoor", state: "Andhra Pradesh", lat: 13.2172, lng: 79.1003 },
  { name: "Hindupur", state: "Andhra Pradesh", lat: 13.8280, lng: 77.4920 },
  { name: "Dharmavaram", state: "Andhra Pradesh", lat: 14.4130, lng: 77.7260 },
  { name: "Kadapa", state: "Andhra Pradesh", lat: 14.4674, lng: 78.8241 },
  { name: "Adoni", state: "Andhra Pradesh", lat: 15.6240, lng: 77.2740 },
  { name: "Madanapalle", state: "Andhra Pradesh", lat: 13.5504, lng: 78.5036 },

  // ── West Bengal – Smaller Towns ──
  { name: "Malda", state: "West Bengal", lat: 25.0108, lng: 88.1411 },
  { name: "Jalpaiguri", state: "West Bengal", lat: 26.5167, lng: 88.7167 },
  { name: "Cooch Behar", state: "West Bengal", lat: 26.3452, lng: 89.4482 },
  { name: "Alipurduar", state: "West Bengal", lat: 26.4882, lng: 89.5302 },
  { name: "Krishnanagar", state: "West Bengal", lat: 23.4010, lng: 88.5010 },
  { name: "Berhampore", state: "West Bengal", lat: 24.1005, lng: 88.2617 },
  { name: "Bolpur", state: "West Bengal", lat: 23.6670, lng: 87.7186 },
  { name: "Bankura", state: "West Bengal", lat: 23.2500, lng: 87.0672 },
  { name: "Purulia", state: "West Bengal", lat: 23.3324, lng: 86.3654 },
  { name: "Tamluk", state: "West Bengal", lat: 22.2271, lng: 87.9192 },
  { name: "Haldia", state: "West Bengal", lat: 22.0667, lng: 88.0698 },
  { name: "Barasat", state: "West Bengal", lat: 22.7227, lng: 88.4804 },
  { name: "Basirhat", state: "West Bengal", lat: 22.6575, lng: 88.8891 },
  { name: "Diamond Harbour", state: "West Bengal", lat: 22.1917, lng: 88.1878 },

  // ── Punjab – Smaller Towns ──
  { name: "Hoshiarpur", state: "Punjab", lat: 31.5143, lng: 75.9115 },
  { name: "Kapurthala", state: "Punjab", lat: 31.3796, lng: 75.3811 },
  { name: "Moga", state: "Punjab", lat: 30.8110, lng: 75.1740 },
  { name: "Firozpur", state: "Punjab", lat: 30.9396, lng: 74.6131 },
  { name: "Fazilka", state: "Punjab", lat: 30.4036, lng: 74.0300 },
  { name: "Muktsar", state: "Punjab", lat: 30.4741, lng: 74.5161 },
  { name: "Barnala", state: "Punjab", lat: 30.3819, lng: 75.5472 },
  { name: "Sangrur", state: "Punjab", lat: 30.2530, lng: 75.8408 },
  { name: "Mansa", state: "Punjab", lat: 29.9913, lng: 75.3868 },
  { name: "Tarn Taran", state: "Punjab", lat: 31.4498, lng: 74.9276 },
  { name: "Gurdaspur", state: "Punjab", lat: 32.0333, lng: 75.4000 },
  { name: "Nawanshahr", state: "Punjab", lat: 31.1245, lng: 76.1156 },
  { name: "Ropar", state: "Punjab", lat: 30.9656, lng: 76.5330 },
  { name: "Rajpura", state: "Punjab", lat: 30.4838, lng: 76.5922 },
  { name: "Zirakpur", state: "Punjab", lat: 30.6425, lng: 76.8173 },
  { name: "Dera Bassi", state: "Punjab", lat: 30.5886, lng: 76.8454 },
  { name: "Phagwara", state: "Punjab", lat: 31.2240, lng: 75.7708 },
  { name: "Khanna", state: "Punjab", lat: 30.6970, lng: 76.2173 },
  { name: "Abohar", state: "Punjab", lat: 30.1453, lng: 74.1950 },

  // ── Haryana – Smaller Towns ──
  { name: "Yamunanagar", state: "Haryana", lat: 30.1290, lng: 77.2674 },
  { name: "Rewari", state: "Haryana", lat: 28.1907, lng: 76.6195 },
  { name: "Jhajjar", state: "Haryana", lat: 28.6068, lng: 76.6556 },
  { name: "Jind", state: "Haryana", lat: 29.3159, lng: 76.3143 },
  { name: "Kaithal", state: "Haryana", lat: 29.8015, lng: 76.3998 },
  { name: "Bhiwani", state: "Haryana", lat: 28.7930, lng: 76.1320 },
  { name: "Mahendragarh", state: "Haryana", lat: 28.2818, lng: 76.1527 },
  { name: "Sirsa", state: "Haryana", lat: 29.5349, lng: 75.0288 },
  { name: "Fatehabad", state: "Haryana", lat: 29.5072, lng: 75.4573 },
  { name: "Narnaul", state: "Haryana", lat: 28.0444, lng: 76.1084 },
  { name: "Palwal", state: "Haryana", lat: 28.1487, lng: 77.3320 },
  { name: "Nuh", state: "Haryana", lat: 28.1010, lng: 77.0030 },
  { name: "Panchkula", state: "Haryana", lat: 30.6942, lng: 76.8606 },
  { name: "Manesar", state: "Haryana", lat: 28.3589, lng: 76.9330 },
  { name: "Bahadurgarh", state: "Haryana", lat: 28.6920, lng: 76.9340 },

  // ── Kerala – Smaller Towns ──
  { name: "Kottayam", state: "Kerala", lat: 9.5916, lng: 76.5222 },
  { name: "Idukki", state: "Kerala", lat: 9.8494, lng: 76.9721 },
  { name: "Pathanamthitta", state: "Kerala", lat: 9.2648, lng: 76.7870 },
  { name: "Wayanad", state: "Kerala", lat: 11.6854, lng: 76.1320 },
  { name: "Kasaragod", state: "Kerala", lat: 12.4996, lng: 74.9869 },
  { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595 },
  { name: "Thodupuzha", state: "Kerala", lat: 9.8940, lng: 76.7196 },
  { name: "Changanassery", state: "Kerala", lat: 9.4433, lng: 76.5406 },
  { name: "Perinthalmanna", state: "Kerala", lat: 10.9787, lng: 76.2280 },
  { name: "Kayamkulam", state: "Kerala", lat: 9.1753, lng: 76.5013 },
  { name: "Cherthala", state: "Kerala", lat: 9.6841, lng: 76.3359 },
  { name: "Attingal", state: "Kerala", lat: 8.6964, lng: 76.8147 },
  { name: "Neyyattinkara", state: "Kerala", lat: 8.3993, lng: 77.0842 },
  { name: "Tirur", state: "Kerala", lat: 10.9122, lng: 75.9230 },
  { name: "Ponnani", state: "Kerala", lat: 10.7672, lng: 75.9230 },
  { name: "Irinjalakuda", state: "Kerala", lat: 10.3432, lng: 76.2093 },
  { name: "Chalakudy", state: "Kerala", lat: 10.3097, lng: 76.3313 },
  { name: "Vadakara", state: "Kerala", lat: 11.6060, lng: 75.4896 },

  // ── Odisha – Smaller Towns ──
  { name: "Balasore", state: "Odisha", lat: 21.4934, lng: 86.9319 },
  { name: "Bargarh", state: "Odisha", lat: 21.3339, lng: 83.6186 },
  { name: "Rayagada", state: "Odisha", lat: 19.1711, lng: 83.4158 },
  { name: "Jeypore", state: "Odisha", lat: 18.8561, lng: 82.5716 },
  { name: "Jharsuguda", state: "Odisha", lat: 21.8554, lng: 84.0066 },
  { name: "Kendrapara", state: "Odisha", lat: 20.5035, lng: 86.4180 },
  { name: "Angul", state: "Odisha", lat: 20.8408, lng: 85.0978 },
  { name: "Dhenkanal", state: "Odisha", lat: 20.6561, lng: 85.5956 },
  { name: "Baripada", state: "Odisha", lat: 21.9334, lng: 86.7258 },
  { name: "Jajpur", state: "Odisha", lat: 20.8527, lng: 86.3369 },

  // ── Jharkhand – Smaller Towns ──
  { name: "Giridih", state: "Jharkhand", lat: 24.1854, lng: 86.3015 },
  { name: "Chaibasa", state: "Jharkhand", lat: 22.5500, lng: 85.8000 },
  { name: "Dumka", state: "Jharkhand", lat: 24.2682, lng: 87.2496 },
  { name: "Godda", state: "Jharkhand", lat: 24.8267, lng: 87.2127 },
  { name: "Ramgarh", state: "Jharkhand", lat: 23.6333, lng: 85.5167 },
  { name: "Phusro", state: "Jharkhand", lat: 23.7707, lng: 86.0109 },
  { name: "Medininagar", state: "Jharkhand", lat: 24.2072, lng: 84.0734 },
  { name: "Chatra", state: "Jharkhand", lat: 24.2070, lng: 84.8710 },
  { name: "Lohardaga", state: "Jharkhand", lat: 23.4353, lng: 84.6838 },
  { name: "Gumla", state: "Jharkhand", lat: 23.0434, lng: 84.5420 },

  // ── Chhattisgarh – Smaller Towns ──
  { name: "Rajnandgaon", state: "Chhattisgarh", lat: 21.0974, lng: 81.0286 },
  { name: "Jagdalpur", state: "Chhattisgarh", lat: 19.0780, lng: 82.0210 },
  { name: "Ambikapur", state: "Chhattisgarh", lat: 23.1185, lng: 83.1974 },
  { name: "Mahasamund", state: "Chhattisgarh", lat: 21.1100, lng: 82.1000 },
  { name: "Kanker", state: "Chhattisgarh", lat: 20.2710, lng: 81.4910 },
  { name: "Dhamtari", state: "Chhattisgarh", lat: 20.7077, lng: 81.5546 },
  { name: "Kawardha", state: "Chhattisgarh", lat: 22.0114, lng: 81.2268 },
  { name: "Janjgir", state: "Chhattisgarh", lat: 22.0088, lng: 82.5749 },

  // ── Uttarakhand – Smaller Towns ──
  { name: "Rudrapur", state: "Uttarakhand", lat: 28.9762, lng: 79.3999 },
  { name: "Kashipur", state: "Uttarakhand", lat: 29.2104, lng: 78.9613 },
  { name: "Pithoragarh", state: "Uttarakhand", lat: 29.5829, lng: 80.2184 },
  { name: "Almora", state: "Uttarakhand", lat: 29.5971, lng: 79.6591 },
  { name: "Bageshwar", state: "Uttarakhand", lat: 29.8380, lng: 79.7710 },
  { name: "Champawat", state: "Uttarakhand", lat: 29.3310, lng: 80.0910 },
  { name: "Uttarkashi", state: "Uttarakhand", lat: 30.7268, lng: 78.4354 },
  { name: "Tehri", state: "Uttarakhand", lat: 30.3928, lng: 78.4346 },
  { name: "Pauri", state: "Uttarakhand", lat: 30.1544, lng: 78.7756 },
  { name: "Kotdwar", state: "Uttarakhand", lat: 29.7458, lng: 78.5339 },
  { name: "Srinagar Garhwal", state: "Uttarakhand", lat: 30.2234, lng: 78.7907 },
  { name: "Ramnagar", state: "Uttarakhand", lat: 29.3940, lng: 79.1260 },
  { name: "Mussoorie", state: "Uttarakhand", lat: 30.4598, lng: 78.0644 },

  // ── Assam – Smaller Towns ──
  { name: "Nagaon", state: "Assam", lat: 26.3465, lng: 92.6840 },
  { name: "Bongaigaon", state: "Assam", lat: 26.4710, lng: 90.5583 },
  { name: "Goalpara", state: "Assam", lat: 26.1700, lng: 90.6260 },
  { name: "Dhubri", state: "Assam", lat: 26.0220, lng: 89.9787 },
  { name: "Karimganj", state: "Assam", lat: 24.8648, lng: 92.3534 },
  { name: "Hailakandi", state: "Assam", lat: 24.6817, lng: 92.5626 },
  { name: "Golaghat", state: "Assam", lat: 26.5133, lng: 93.9639 },
  { name: "Sivasagar", state: "Assam", lat: 26.9826, lng: 94.6380 },
  { name: "Lakhimpur", state: "Assam", lat: 27.2358, lng: 94.1050 },
  { name: "Tinsukia", state: "Assam", lat: 27.4888, lng: 95.3596 },
  { name: "Kokrajhar", state: "Assam", lat: 26.3987, lng: 90.2680 },
  { name: "Nalbari", state: "Assam", lat: 26.4445, lng: 91.4417 },
  { name: "Barpeta", state: "Assam", lat: 26.3210, lng: 91.0079 },
  { name: "Darrang", state: "Assam", lat: 26.4399, lng: 92.1696 },
  { name: "Morigaon", state: "Assam", lat: 26.2484, lng: 92.3454 },

  // ── Himachal Pradesh – Smaller Towns ──
  { name: "Una", state: "Himachal Pradesh", lat: 31.4685, lng: 76.2708 },
  { name: "Hamirpur", state: "Himachal Pradesh", lat: 31.6862, lng: 76.5232 },
  { name: "Bilaspur", state: "Himachal Pradesh", lat: 31.3397, lng: 76.7568 },
  { name: "Nahan", state: "Himachal Pradesh", lat: 30.5596, lng: 77.2960 },
  { name: "Chamba", state: "Himachal Pradesh", lat: 32.5534, lng: 76.1258 },
  { name: "Kangra", state: "Himachal Pradesh", lat: 32.0998, lng: 76.2691 },
  { name: "Palampur", state: "Himachal Pradesh", lat: 32.1109, lng: 76.5364 },
  { name: "Sundernagar", state: "Himachal Pradesh", lat: 31.5211, lng: 76.9050 },
  { name: "Rampur", state: "Himachal Pradesh", lat: 31.4508, lng: 77.6303 },
  { name: "Keylong", state: "Himachal Pradesh", lat: 32.5771, lng: 77.0408 },
];

export default INDIAN_CITIES;

// ─── HAVERSINE DISTANCE CALCULATOR ──────────────────────────────────────────
// Returns distance in KILOMETERS between two lat/lng points
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // rounded to whole km
}

// ─── SEARCH CITIES ──────────────────────────────────────────────────────────
// Returns matching cities for autocomplete, max 8 results
export function searchCities(query, maxResults = 8) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();

  // Exact name match first, then startsWith, then includes
  const exactMatch = [];
  const startsWith = [];
  const includes = [];

  for (const city of INDIAN_CITIES) {
    const name = city.name.toLowerCase();
    const state = city.state.toLowerCase();
    const combo = `${name}, ${state}`;

    if (name === q) {
      exactMatch.push(city);
    } else if (name.startsWith(q) || combo.startsWith(q)) {
      startsWith.push(city);
    } else if (name.includes(q) || state.includes(q)) {
      includes.push(city);
    }
  }

  return [...exactMatch, ...startsWith, ...includes].slice(0, maxResults);
}

// ─── FIND CITY BY NAME ─────────────────────────────────────────────────────
// Returns the first city matching the given name (case-insensitive)
export function findCityByName(name) {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  // Try matching "City, State" format first
  const commaIdx = n.indexOf(",");
  if (commaIdx > -1) {
    const cityPart = n.substring(0, commaIdx).trim();
    const statePart = n.substring(commaIdx + 1).trim();
    return INDIAN_CITIES.find(
      (c) =>
        c.name.toLowerCase() === cityPart &&
        c.state.toLowerCase() === statePart
    ) || INDIAN_CITIES.find((c) => c.name.toLowerCase() === cityPart) || null;
  }
  return INDIAN_CITIES.find((c) => c.name.toLowerCase() === n) || null;
}

// ─── CALCULATE TRANSPORT CHARGE ─────────────────────────────────────────────
// Rate: ₹12 per km
export const RATE_PER_KM = 12;

export function calculateTransportCharge(pickupCity, dropCity) {
  const pickup = findCityByName(pickupCity);
  const drop = findCityByName(dropCity);

  if (!pickup || !drop) return { distance: 0, charge: 0, found: false };

  const distance = haversineDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
  // Use 1.3x multiplier to approximate road distance from straight-line distance
  const roadDistance = Math.round(distance * 1.3);
  const charge = roadDistance * RATE_PER_KM;

  return { distance: roadDistance, charge, found: true, pickup, drop };
}
