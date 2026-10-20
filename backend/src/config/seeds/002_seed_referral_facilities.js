const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  const existing = await knex('referral_facilities').count('id as count').first();
  if (existing.count > 0) return;

  await knex('referral_facilities').insert([
    // Mombasa
    { id: uuidv4(), name: 'Coast General Teaching & Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Mombasa', sub_county: 'Mvita', ward: 'Majengo', phone: '+254412319301', address: 'P.O. Box 90231-80100, Mombasa' },
    { id: uuidv4(), name: 'Port Reitz Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Mombasa', sub_county: 'Changamwe', ward: 'Port Reitz', phone: '+254412223111', address: 'P.O. Box 83620-80100, Mombasa' },
    { id: uuidv4(), name: 'Tudor Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Mombasa', sub_county: 'Mvita', ward: 'Tudor', phone: '+254412314582', address: 'P.O. Box 90231-80100, Mombasa' },
    { id: uuidv4(), name: 'Likoni Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Mombasa', sub_county: 'Likoni', ward: 'Mtongwe', phone: '+254415485211', address: 'P.O. Box 84657-80100, Mombasa' },
    { id: uuidv4(), name: 'Shimo La Tewa Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Mombasa', sub_county: 'Kisauni', ward: 'Bamburi', phone: '+254412314755', address: 'P.O. Box 90130-80100, Mombasa' },

    // Kwale
    { id: uuidv4(), name: 'Msambweni County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kwale', sub_county: 'Msambweni', ward: 'Msambweni', phone: '+254405145020', address: 'P.O. Box 1-80404, Msambweni' },
    { id: uuidv4(), name: 'Kwale Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kwale', sub_county: 'Matuga', ward: 'Waa', phone: '+254405213171', address: 'P.O. Box 24-80403, Kwale' },
    { id: uuidv4(), name: 'Kinango Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kwale', sub_county: 'Kinango', ward: 'Kinango', phone: '+254405210223', address: 'P.O. Box 56-80406, Kinango' },
    { id: uuidv4(), name: 'Lungalunga Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kwale', sub_county: 'Lungalunga', ward: 'Vanga', phone: null, address: 'P.O. Box 52-80405, Lunga Lunga' },
    { id: uuidv4(), name: 'Diani Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kwale', sub_county: 'Msambweni', ward: 'Ukunda', phone: null, address: 'P.O. Box 89-80401, Diani' },

    // Kilifi
    { id: uuidv4(), name: 'Kilifi County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kilifi', sub_county: 'Kilifi North', ward: 'Mnarani', phone: '+254417522033', address: 'P.O. Box 9-80108, Kilifi' },
    { id: uuidv4(), name: 'Malindi Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kilifi', sub_county: 'Malindi', ward: 'Malindi Town', phone: '+254425430304', address: 'P.O. Box 229-80200, Malindi' },
    { id: uuidv4(), name: 'Mariakani Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kilifi', sub_county: 'Kaloleni', ward: 'Mariakani', phone: '+254417520220', address: 'P.O. Box 40-80111, Mariakani' },
    { id: uuidv4(), name: 'Ganze Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kilifi', sub_county: 'Ganze', ward: 'Ganze', phone: null, address: 'P.O. Box 47-80203, Ganze' },
    { id: uuidv4(), name: 'Mtwapa Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kilifi', sub_county: 'Kilifi South', ward: 'Mwarakaya', phone: null, address: 'P.O. Box 502-80109, Mtwapa' },
    { id: uuidv4(), name: 'Magarini Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kilifi', sub_county: 'Magarini', ward: 'Magarini', phone: null, address: 'P.O. Box 53-80204, Magarini' },

    // Tana River
    { id: uuidv4(), name: 'Hola County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Tana River', sub_county: 'Galole', ward: 'Wayu', phone: '+254462242259', address: 'P.O. Box 2-70101, Hola' },
    { id: uuidv4(), name: 'Bura Sub-County Hospital (Tana River)', type: 'Sub-County Hospital', level: 'Level 4', county: 'Tana River', sub_county: 'Bura', ward: 'Bangale', phone: null, address: 'P.O. Box 3-70102, Bura' },
    { id: uuidv4(), name: 'Garsen Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Tana River', sub_county: 'Garsen', ward: 'Garsen Central', phone: null, address: 'P.O. Box 25-70103, Garsen' },
    { id: uuidv4(), name: 'Madogo Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Tana River', sub_county: 'Bura', ward: 'Madogo', phone: null, address: 'P.O. Box 25-70103, Madogo' },

    // Lamu
    { id: uuidv4(), name: 'King Fahd Lamu County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Lamu', sub_county: 'Lamu West', ward: 'Mkomani', phone: '+254426333231', address: 'P.O. Box 87-80500, Lamu' },
    { id: uuidv4(), name: 'Mpeketoni Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Lamu', sub_county: 'Lamu West', ward: 'Hindi', phone: null, address: 'P.O. Box 97-80501, Mpeketoni' },
    { id: uuidv4(), name: 'Witu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Lamu', sub_county: 'Lamu West', ward: 'Witu', phone: null, address: 'P.O. Box 83-80502, Witu' },
    { id: uuidv4(), name: 'Faza Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Lamu', sub_county: 'Lamu East', ward: 'Faza', phone: null, address: 'P.O. Box 47-80503, Faza' },

    // Taita Taveta
    { id: uuidv4(), name: 'Moi County Referral Hospital Voi', type: 'County Referral Hospital', level: 'Level 5', county: 'Taita Taveta', sub_county: 'Voi', ward: 'Kaloleni', phone: '+254432000214', address: 'P.O. Box 28-80300, Voi' },
    { id: uuidv4(), name: 'Taveta Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Taita Taveta', sub_county: 'Taveta', ward: 'Bomani', phone: null, address: 'P.O. Box 135-80304, Taveta' },
    { id: uuidv4(), name: 'Mwatate Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Taita Taveta', sub_county: 'Mwatate', ward: 'Mwatate', phone: null, address: 'P.O. Box 10-80302, Mwatate' },
    { id: uuidv4(), name: 'Wundanyi Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Taita Taveta', sub_county: 'Wundanyi', ward: 'Wundanyi/Mbale', phone: null, address: 'P.O. Box 5-80303, Wundanyi' },
    { id: uuidv4(), name: 'Bura Health Centre (Taita)', type: 'Health Centre', level: 'Level 3', county: 'Taita Taveta', sub_county: 'Mwatate', ward: 'Bura', phone: null, address: 'P.O. Box 10-80400, Mwatate' },

    // Garissa
    { id: uuidv4(), name: 'Garissa County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Garissa', sub_county: 'Garissa Township', ward: 'Township', phone: '+254462101081', address: 'P.O. Box 41-70100, Garissa' },
    { id: uuidv4(), name: 'Dadaab Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Garissa', sub_county: 'Dadaab', ward: 'Dadaab', phone: null, address: 'P.O. Box 92-70107, Dadaab' },
    { id: uuidv4(), name: 'Ijara Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Garissa', sub_county: 'Ijara', ward: 'Ijara', phone: null, address: 'P.O. Box 6-70109, Ijara' },
    { id: uuidv4(), name: 'Bura Sub-County Hospital (Garissa)', type: 'Sub-County Hospital', level: 'Level 4', county: 'Garissa', sub_county: 'Fafi', ward: 'Bura', phone: null, address: 'P.O. Box 21-70106, Bura' },
    { id: uuidv4(), name: 'Masalani Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Garissa', sub_county: 'Ijara', ward: 'Masalani', phone: null, address: 'P.O. Box 6-70109, Ijara' },

    // Wajir
    { id: uuidv4(), name: 'Wajir County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Wajir', sub_county: 'Wajir East', ward: 'Township', phone: '+254462522125', address: 'P.O. Box 9-70200, Wajir' },
    { id: uuidv4(), name: 'Habaswein Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Wajir', sub_county: 'Wajir South', ward: 'Habasswein', phone: null, address: 'P.O. Box 28-70203, Habaswein' },
    { id: uuidv4(), name: 'Buna Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Wajir', sub_county: 'Wajir East', ward: 'Barwago', phone: null, address: 'P.O. Box 41-70201, Buna' },
    { id: uuidv4(), name: 'Eldas Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Wajir', sub_county: 'Eldas', ward: 'Eldas', phone: null, address: 'P.O. Box 29-70204, Eldas' },
    { id: uuidv4(), name: 'Korondile Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Wajir', sub_county: 'Tarbaj', ward: 'Korondile', phone: null, address: 'P.O. Box 12-70200, Wajir' },

    // Mandera
    { id: uuidv4(), name: 'Mandera County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Mandera', sub_county: 'Mandera East', ward: 'Township', phone: '+254462101195', address: 'P.O. Box 18-70300, Mandera' },
    { id: uuidv4(), name: 'Rhamu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Mandera', sub_county: 'Mandera North', ward: 'Rhamu', phone: null, address: 'P.O. Box 28-70301, Rhamu' },
    { id: uuidv4(), name: 'Takaba Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Mandera', sub_county: 'Mandera West', ward: 'Takaba', phone: null, address: 'P.O. Box 33-70303, Takaba' },
    { id: uuidv4(), name: 'Lafey Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Mandera', sub_county: 'Lafey', ward: 'Lafey', phone: null, address: 'P.O. Box 57-70304, Lafey' },
    { id: uuidv4(), name: 'Banisa Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Mandera', sub_county: 'Banissa', ward: 'Banissa', phone: null, address: 'P.O. Box 16-70305, Banisa' },
    { id: uuidv4(), name: 'Elwak Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Mandera', sub_county: 'Banissa', ward: 'Malkamari', phone: null, address: 'P.O. Box 12-70305, Banisa' },

    // Marsabit
    { id: uuidv4(), name: 'Marsabit County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Marsabit', sub_county: 'Marsabit Central', ward: 'Saku', phone: '+254462620045', address: 'P.O. Box 1-60500, Marsabit' },
    { id: uuidv4(), name: 'Moyale Sub-County Hospital (Marsabit)', type: 'Sub-County Hospital', level: 'Level 4', county: 'Marsabit', sub_county: 'Moyale', ward: 'Butiye', phone: null, address: 'P.O. Box 13-60501, Moyale' },
    { id: uuidv4(), name: 'Laisamis Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Marsabit', sub_county: 'Laisamis', ward: 'Laisamis', phone: null, address: 'P.O. Box 14-60502, Laisamis' },
    { id: uuidv4(), name: 'North Horr Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Marsabit', sub_county: 'North Horr', ward: 'North Horr', phone: null, address: 'P.O. Box 26-60500, North Horr' },

    // Isiolo
    { id: uuidv4(), name: 'Isiolo County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Isiolo', sub_county: 'Isiolo', ward: 'Burat', phone: '+254641230407', address: 'P.O. Box 1-60300, Isiolo' },
    { id: uuidv4(), name: 'Garbatulla Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Isiolo', sub_county: 'Garbatulla', ward: 'Garbatulla', phone: null, address: 'P.O. Box 4-60201, Garbatulla' },
    { id: uuidv4(), name: 'Merti Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Isiolo', sub_county: 'Merti', ward: 'Merti', phone: null, address: 'P.O. Box 14-60301, Merti' },
    { id: uuidv4(), name: 'Oldonyiro Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Isiolo', sub_county: 'Isiolo', ward: 'Oldonyiro', phone: null, address: 'P.O. Box 26-60300, Oldonyiro' },

    // Meru
    { id: uuidv4(), name: 'Meru County Teaching & Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Meru', sub_county: 'Imenti Central', ward: 'Gitoro', phone: '+254641230407', address: 'P.O. Box 1-60200, Meru' },
    { id: uuidv4(), name: 'Maua Methodist Hospital', type: 'Sub-County Hospital', level: 'Level 5', county: 'Meru', sub_county: 'Tigania West', ward: 'Maua', phone: '+254641230407', address: 'P.O. Box 63-60202, Maua' },
    { id: uuidv4(), name: 'Nkubu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Meru', sub_county: 'Imenti South', ward: 'Nkubu', phone: null, address: 'P.O. Box 10-60203, Nkubu' },
    { id: uuidv4(), name: 'Nyambene Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Meru', sub_county: 'Igembe South', ward: 'Kangeta', phone: null, address: 'P.O. Box 29-60204, Kangeta' },
    { id: uuidv4(), name: 'Chogoria Mission Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Meru', sub_county: 'Maara', ward: 'Chogoria', phone: null, address: 'P.O. Box 35-60205, Chogoria' },
    { id: uuidv4(), name: 'Kiirua Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Meru', sub_county: 'Buuri', ward: 'Kiirua', phone: null, address: 'P.O. Box 48-60200, Kiirua' },

    // Tharaka Nithi
    { id: uuidv4(), name: 'Chuka County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Tharaka Nithi', sub_county: 'Chuka', ward: 'Magumoni', phone: null, address: 'P.O. Box 1-60400, Chuka' },
    { id: uuidv4(), name: 'Tharaka Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Tharaka Nithi', sub_county: 'Tharaka', ward: 'Marimanti', phone: null, address: 'P.O. Box 27-60401, Marimanti' },
    { id: uuidv4(), name: 'St. Orsola Mission Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Tharaka Nithi', sub_county: 'Chuka', ward: 'Mutegi', phone: null, address: 'P.O. Box 52-60400, Chuka' },
    { id: uuidv4(), name: 'Tuungani Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Tharaka Nithi', sub_county: 'Maara', ward: 'Karingani', phone: null, address: 'P.O. Box 19-60402, Karingani' },

    // Embu
    { id: uuidv4(), name: 'Embu County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Embu', sub_county: 'Manyatta', ward: 'Kangaru', phone: null, address: 'P.O. Box 10-60100, Embu' },
    { id: uuidv4(), name: 'Ishiara Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Embu', sub_county: 'Mbeere South', ward: 'Ishiara', phone: null, address: 'P.O. Box 9-60101, Ishiara' },
    { id: uuidv4(), name: 'Siakago Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Embu', sub_county: 'Mbeere North', ward: 'Siakago', phone: null, address: 'P.O. Box 21-60102, Siakago' },
    { id: uuidv4(), name: 'Kianjokoma Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Embu', sub_county: 'Manyatta', ward: 'Kianjokoma', phone: null, address: 'P.O. Box 33-60100, Kianjokoma' },

    // Kitui
    { id: uuidv4(), name: 'Kitui County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kitui', sub_county: 'Kitui Central', ward: 'Township', phone: null, address: 'P.O. Box 1-90200, Kitui' },
    { id: uuidv4(), name: 'Mwingi Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kitui', sub_county: 'Mwingi Central', ward: 'Waita', phone: null, address: 'P.O. Box 23-90400, Mwingi' },
    { id: uuidv4(), name: 'Kyuso Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kitui', sub_county: 'Mwingi North', ward: 'Kyuso', phone: null, address: 'P.O. Box 12-90402, Kyuso' },
    { id: uuidv4(), name: 'Mutomo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kitui', sub_county: 'Kitui South', ward: 'Mutomo', phone: null, address: 'P.O. Box 48-90201, Mutomo' },

    // Machakos
    { id: uuidv4(), name: 'Machakos Level 5 Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Machakos', sub_county: 'Machakos Central', ward: 'Mumbuni', phone: null, address: 'P.O. Box 1-90100, Machakos' },
    { id: uuidv4(), name: 'Kangundo Level 4 Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Machakos', sub_county: 'Kangundo', ward: 'Kangundo', phone: null, address: 'P.O. Box 34-90101, Kangundo' },
    { id: uuidv4(), name: 'Kathiani Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Machakos', sub_county: 'Kathiani', ward: 'Mitaboni', phone: null, address: 'P.O. Box 22-90102, Kathiani' },
    { id: uuidv4(), name: 'Mwala Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Machakos', sub_county: 'Mwala', ward: 'Mwala', phone: null, address: 'P.O. Box 19-90103, Mwala' },
    { id: uuidv4(), name: 'Tala Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Machakos', sub_county: 'Matungulu', ward: 'Tala', phone: null, address: 'P.O. Box 41-90104, Tala' },

    // Makueni
    { id: uuidv4(), name: 'Makueni County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Makueni', sub_county: 'Makueni', ward: 'Wote', phone: null, address: 'P.O. Box 1-90300, Makueni' },
    { id: uuidv4(), name: 'Sultan Hamud Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Makueni', sub_county: 'Kibwezi East', ward: 'Sultan Hamud', phone: null, address: 'P.O. Box 44-90301, Sultan Hamud' },
    { id: uuidv4(), name: 'Mtito Andei Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Makueni', sub_county: 'Kibwezi West', ward: 'Mtito Andei', phone: null, address: 'P.O. Box 28-90302, Mtito Andei' },
    { id: uuidv4(), name: 'Nzaui Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Makueni', sub_county: 'Nzaui', ward: 'Kilungu', phone: null, address: 'P.O. Box 17-90303, Nzaui' },
    { id: uuidv4(), name: 'Emali Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Makueni', sub_county: 'Kibwezi East', ward: 'Emali', phone: null, address: 'P.O. Box 50-90300, Emali' },
  ]);
};
