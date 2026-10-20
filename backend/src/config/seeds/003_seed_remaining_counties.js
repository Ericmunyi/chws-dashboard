const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  const existingCounties = await knex('referral_facilities').distinct('county').pluck('county');

  const rows = [

    // ==================== CENTRAL KENYA ====================

    // Nyandarua
    { id: uuidv4(), name: 'Ol Kalou County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Nyandarua', sub_county: 'Ol Kalou', ward: 'Central', phone: null, address: 'P.O. Box 2-20300, Ol Kalou' },
    { id: uuidv4(), name: 'Engineer Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyandarua', sub_county: 'Githioro', ward: 'Engineer', phone: null, address: 'P.O. Box 28-20303, Engineer' },
    { id: uuidv4(), name: 'Ndaragwa Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyandarua', sub_county: 'Ndaragwa', ward: 'Ndaragwa', phone: null, address: 'P.O. Box 12-20304, Ndaragwa' },
    { id: uuidv4(), name: 'Ol Joro Orok Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyandarua', sub_county: 'Ol Joro Orok', ward: 'Ol Joro Orok', phone: null, address: 'P.O. Box 45-20302, Ol Joro Orok' },
    { id: uuidv4(), name: 'Kipipiri Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nyandarua', sub_county: 'Kipipiri', ward: 'Kipipiri', phone: null, address: 'P.O. Box 19-20305, Kipipiri' },
    { id: uuidv4(), name: 'Kitengela Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nyandarua', sub_county: 'Ol Kalou', ward: 'Kanjuiri', phone: null, address: 'P.O. Box 11-20300, Ol Kalou' },

    // Nyeri
    { id: uuidv4(), name: 'Nyeri County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Nyeri', sub_county: 'Nyeri Central', ward: 'Township', phone: null, address: 'P.O. Box 1-10100, Nyeri' },
    { id: uuidv4(), name: 'Karatina Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyeri', sub_county: 'Mathira East', ward: 'Karatina', phone: null, address: 'P.O. Box 33-10101, Karatina' },
    { id: uuidv4(), name: 'Othaya Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyeri', sub_county: 'Othaya', ward: 'Othaya', phone: null, address: 'P.O. Box 28-10103, Othaya' },
    { id: uuidv4(), name: 'Kieni Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyeri', sub_county: 'Kieni East', ward: 'Kieni', phone: null, address: 'P.O. Box 42-10104, Kieni' },
    { id: uuidv4(), name: 'Tetu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyeri', sub_county: 'Tetu', ward: 'Dedan Kimathi', phone: null, address: 'P.O. Box 17-10106, Tetu' },
    { id: uuidv4(), name: 'Mukurweini Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyeri', sub_county: 'Mathira West', ward: 'Mukurweini', phone: null, address: 'P.O. Box 24-10102, Mukurweini' },

    // Kirinyaga
    { id: uuidv4(), name: 'Kerugoya County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kirinyaga', sub_county: 'Kirinyaga Central', ward: 'Kerugoya', phone: null, address: 'P.O. Box 23-10200, Kerugoya' },
    { id: uuidv4(), name: 'Sagana Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kirinyaga', sub_county: 'Kirinyaga South', ward: 'Sagana', phone: null, address: 'P.O. Box 18-10203, Sagana' },
    { id: uuidv4(), name: 'Kutus Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kirinyaga', sub_county: 'Kirinyaga Central', ward: 'Kutus', phone: null, address: 'P.O. Box 34-10200, Kutus' },
    { id: uuidv4(), name: 'Baricho Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kirinyaga', sub_county: 'Kirinyaga North', ward: 'Baricho', phone: null, address: 'P.O. Box 41-10201, Baricho' },
    { id: uuidv4(), name: 'Karumandi Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kirinyaga', sub_county: 'Mwea', ward: 'Karumandi', phone: null, address: 'P.O. Box 56-10202, Karumandi' },

    // Murang'a
    { id: uuidv4(), name: 'Murang\'a County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Murang\'a', sub_county: 'Murang\'a Central', ward: 'Township', phone: null, address: 'P.O. Box 1-10200, Murang\'a' },
    { id: uuidv4(), name: 'Thika Level 5 Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Murang\'a', sub_county: 'Kandara', ward: 'Thika', phone: null, address: 'P.O. Box 1-01000, Thika' },
    { id: uuidv4(), name: 'Kiriaini Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Murang\'a', sub_county: 'Mathioya', ward: 'Kiriaini', phone: null, address: 'P.O. Box 28-10211, Kiriaini' },
    { id: uuidv4(), name: 'Kangema Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Murang\'a', sub_county: 'Kangema', ward: 'Kangema', phone: null, address: 'P.O. Box 34-10210, Kangema' },
    { id: uuidv4(), name: 'Maragua Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Murang\'a', sub_county: 'Maragua', ward: 'Maragua', phone: null, address: 'P.O. Box 45-10202, Maragua' },
    { id: uuidv4(), name: 'Kiharu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Murang\'a', sub_county: 'Kiharu', ward: 'Kiharu', phone: null, address: 'P.O. Box 52-10201, Kiharu' },
    { id: uuidv4(), name: 'Gatanga Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Murang\'a', sub_county: 'Gatanga', ward: 'Gatanga', phone: null, address: 'P.O. Box 67-10203, Gatanga' },
    { id: uuidv4(), name: 'Kandara Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Murang\'a', sub_county: 'Kandara', ward: 'Kandara', phone: null, address: 'P.O. Box 78-10204, Kandara' },

    // Kiambu
    { id: uuidv4(), name: 'Kiambu County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kiambu', sub_county: 'Kiambu', ward: 'Township', phone: null, address: 'P.O. Box 412-00900, Kiambu' },
    { id: uuidv4(), name: 'Thika Level 5 Hospital (Kiambu)', type: 'County Referral Hospital', level: 'Level 5', county: 'Kiambu', sub_county: 'Thika', ward: 'Township', phone: null, address: 'P.O. Box 1-01000, Thika' },
    { id: uuidv4(), name: 'Limuru Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kiambu', sub_county: 'Limuru', ward: 'Limuru', phone: null, address: 'P.O. Box 45-00217, Limuru' },
    { id: uuidv4(), name: 'Kikuyu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kiambu', sub_county: 'Kikuyu', ward: 'Kikuyu', phone: null, address: 'P.O. Box 52-00903, Kikuyu' },
    { id: uuidv4(), name: 'Lari Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kiambu', sub_county: 'Lari', ward: 'Lari', phone: null, address: 'P.O. Box 67-00906, Lari' },
    { id: uuidv4(), name: 'Githunguri Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kiambu', sub_county: 'Githunguri', ward: 'Githunguri', phone: null, address: 'P.O. Box 78-00907, Githunguri' },
    { id: uuidv4(), name: 'Juja Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kiambu', sub_county: 'Gatundu South', ward: 'Juja', phone: null, address: 'P.O. Box 89-01001, Juja' },
    { id: uuidv4(), name: 'Ruiru Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kiambu', sub_county: 'Ruiru', ward: 'Ruiru', phone: null, address: 'P.O. Box 101-00200, Ruiru' },
    { id: uuidv4(), name: 'Karuri Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kiambu', sub_county: 'Kiambu', ward: 'Karuri', phone: null, address: 'P.O. Box 112-00902, Karuri' },
    { id: uuidv4(), name: 'Gachie Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kiambu', sub_county: 'Kiambu', ward: 'Gachie', phone: null, address: 'P.O. Box 123-00901, Gachie' },

    // ==================== RIFT VALLEY ====================

    // Turkana
    { id: uuidv4(), name: 'Turkana County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Turkana', sub_county: 'Turkana Central', ward: 'Township', phone: null, address: 'P.O. Box 16-30500, Lodwar' },
    { id: uuidv4(), name: 'Lodwar County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Turkana', sub_county: 'Turkana Central', ward: 'Lodwar', phone: null, address: 'P.O. Box 17-30500, Lodwar' },
    { id: uuidv4(), name: 'Lokichoggio Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Turkana', sub_county: 'Turkana West', ward: 'Lokichoggio', phone: null, address: 'P.O. Box 28-30501, Lokichoggio' },
    { id: uuidv4(), name: 'Kakuma Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Turkana', sub_county: 'Turkana West', ward: 'Kakuma', phone: null, address: 'P.O. Box 34-30502, Kakuma' },
    { id: uuidv4(), name: 'Lokori Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Turkana', sub_county: 'Turkana South', ward: 'Lokori', phone: null, address: 'P.O. Box 45-30503, Lokori' },
    { id: uuidv4(), name: 'Loyangalani Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Turkana', sub_county: 'Turkana East', ward: 'Loyangalani', phone: null, address: 'P.O. Box 56-30504, Loyangalani' },
    { id: uuidv4(), name: 'Kaputir Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Turkana', sub_county: 'Turkana South', ward: 'Kaputir', phone: null, address: 'P.O. Box 67-30503, Kaputir' },

    // West Pokot
    { id: uuidv4(), name: 'Kapenguria County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'West Pokot', sub_county: 'Pokot Central', ward: 'Kapenguria', phone: null, address: 'P.O. Box 60-30600, Kapenguria' },
    { id: uuidv4(), name: 'Sigor Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'West Pokot', sub_county: 'Pokot West', ward: 'Sigor', phone: null, address: 'P.O. Box 28-30603, Sigor' },
    { id: uuidv4(), name: 'Talek Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'West Pokot', sub_county: 'Pokot North', ward: 'Talek', phone: null, address: 'P.O. Box 34-30604, Talek' },
    { id: uuidv4(), name: 'Kasei Health Centre', type: 'Health Centre', level: 'Level 3', county: 'West Pokot', sub_county: 'Pokot South', ward: 'Kasei', phone: null, address: 'P.O. Box 45-30605, Kasei' },
    { id: uuidv4(), name: 'Parua Health Centre', type: 'Health Centre', level: 'Level 3', county: 'West Pokot', sub_county: 'Pokot Central', ward: 'Parua', phone: null, address: 'P.O. Box 56-30600, Parua' },

    // Samburu
    { id: uuidv4(), name: 'Maralal County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Samburu', sub_county: 'Samburu Central', ward: 'Maralal', phone: null, address: 'P.O. Box 3-20600, Maralal' },
    { id: uuidv4(), name: 'Wamba Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Samburu', sub_county: 'Samburu East', ward: 'Wamba', phone: null, address: 'P.O. Box 28-20602, Wamba' },
    { id: uuidv4(), name: 'Baragoi Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Samburu', sub_county: 'Samburu North', ward: 'Baragoi', phone: null, address: 'P.O. Box 34-20603, Baragoi' },
    { id: uuidv4(), name: 'Arba Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Samburu', sub_county: 'Samburu Central', ward: 'Arba', phone: null, address: 'P.O. Box 45-20600, Arba' },
    { id: uuidv4(), name: 'Lporoko Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Samburu', sub_county: 'Samburu West', ward: 'Lporoko', phone: null, address: 'P.O. Box 56-20601, Lporoko' },

    // Trans-Nzoia
    { id: uuidv4(), name: 'Kitale County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Trans-Nzoia', sub_county: 'Kitale Central', ward: 'Township', phone: null, address: 'P.O. Box 1-30200, Kitale' },
    { id: uuidv4(), name: 'Kiminini Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Trans-Nzoia', sub_county: 'Kiminini', ward: 'Kiminini', phone: null, address: 'P.O. Box 28-30203, Kiminini' },
    { id: uuidv4(), name: 'Endebess Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Trans-Nzoia', sub_county: 'Endebess', ward: 'Endebess', phone: null, address: 'P.O. Box 34-30204, Endebess' },
    { id: uuidv4(), name: 'Saboti Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Trans-Nzoia', sub_county: 'Saboti', ward: 'Saboti', phone: null, address: 'P.O. Box 45-30205, Saboti' },
    { id: uuidv4(), name: 'Kwanza Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Trans-Nzoia', sub_county: 'Kwanza', ward: 'Kwanza', phone: null, address: 'P.O. Box 56-30206, Kwanza' },

    // Uasin Gishu
    { id: uuidv4(), name: 'Moi Teaching & Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Uasin Gishu', sub_county: 'Ainabkoi', ward: 'Kapsoya', phone: null, address: 'P.O. Box 3-30100, Eldoret' },
    { id: uuidv4(), name: 'Eldoret Level 5 Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Uasin Gishu', sub_county: 'Kesses', ward: 'Township', phone: null, address: 'P.O. Box 1095-30100, Eldoret' },
    { id: uuidv4(), name: 'Turbo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Uasin Gishu', sub_county: 'Turbo', ward: 'Turbo', phone: null, address: 'P.O. Box 28-30302, Turbo' },
    { id: uuidv4(), name: 'Moiben Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Uasin Gishu', sub_county: 'Moiben', ward: 'Moiben', phone: null, address: 'P.O. Box 34-30303, Moiben' },
    { id: uuidv4(), name: 'Kapseret Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Uasin Gishu', sub_county: 'Kapseret', ward: 'Kapseret', phone: null, address: 'P.O. Box 45-30100, Eldoret' },
    { id: uuidv4(), name: 'Kesses Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Uasin Gishu', sub_county: 'Kesses', ward: 'Kesses', phone: null, address: 'P.O. Box 56-30101, Kesses' },
    { id: uuidv4(), name: 'Ainabkoi Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Uasin Gishu', sub_county: 'Ainabkoi', ward: 'Ainabkoi', phone: null, address: 'P.O. Box 67-30100, Ainabkoi' },

    // Elgeyo-Marakwet
    { id: uuidv4(), name: 'Iten County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Elgeyo-Marakwet', sub_county: 'Keiyo North', ward: 'Iten', phone: null, address: 'P.O. Box 5-30700, Iten' },
    { id: uuidv4(), name: 'Chogoria Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Elgeyo-Marakwet', sub_county: 'Keiyo South', ward: 'Chogoria', phone: null, address: 'P.O. Box 28-30702, Chogoria' },
    { id: uuidv4(), name: 'Kamariny Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Elgeyo-Marakwet', sub_county: 'Keiyo North', ward: 'Kamariny', phone: null, address: 'P.O. Box 34-30700, Kamariny' },
    { id: uuidv4(), name: 'Endo Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Elgeyo-Marakwet', sub_county: 'Marakwet East', ward: 'Endo', phone: null, address: 'P.O. Box 45-30703, Endo' },
    { id: uuidv4(), name: 'Kapsowar Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Elgeyo-Marakwet', sub_county: 'Marakwet West', ward: 'Kapsowar', phone: null, address: 'P.O. Box 56-30704, Kapsowar' },

    // Nandi
    { id: uuidv4(), name: 'Kapsabet County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Nandi', sub_county: 'Nandi Central', ward: 'Kapsabet', phone: null, address: 'P.O. Box 1-30300, Kapsabet' },
    { id: uuidv4(), name: 'Chavakali Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nandi', sub_county: 'Nandi Hills', ward: 'Chavakali', phone: null, address: 'P.O. Box 28-30301, Chavakali' },
    { id: uuidv4(), name: 'Mosoriot Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nandi', sub_county: 'Tinderet', ward: 'Mosoriot', phone: null, address: 'P.O. Box 34-30302, Mosoriot' },
    { id: uuidv4(), name: 'Kabiyet Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nandi', sub_county: 'Nandi North', ward: 'Kabiyet', phone: null, address: 'P.O. Box 45-30303, Kabiyet' },
    { id: uuidv4(), name: 'Kaiboi Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nandi', sub_county: 'Nandi South', ward: 'Kaiboi', phone: null, address: 'P.O. Box 56-30304, Kaiboi' },

    // Baringo
    { id: uuidv4(), name: 'Kabarnet County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Baringo', sub_county: 'Baringo Central', ward: 'Kabarnet', phone: null, address: 'P.O. Box 1-30400, Kabarnet' },
    { id: uuidv4(), name: 'Eldama Ravine Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Baringo', sub_county: 'Baringo North', ward: 'Eldama Ravine', phone: null, address: 'P.O. Box 28-30402, Eldama Ravine' },
    { id: uuidv4(), name: 'Mogotio Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Baringo', sub_county: 'Mogotio', ward: 'Mogotio', phone: null, address: 'P.O. Box 34-30403, Mogotio' },
    { id: uuidv4(), name: 'Marigat Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Baringo', sub_county: 'Baringo South', ward: 'Marigat', phone: null, address: 'P.O. Box 45-30404, Marigat' },
    { id: uuidv4(), name: 'Tiaty Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Baringo', sub_county: 'Tiaty', ward: 'Tiaty', phone: null, address: 'P.O. Box 56-30405, Tiaty' },
    { id: uuidv4(), name: 'Baringo Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Baringo', sub_county: 'Baringo Central', ward: 'Baringo', phone: null, address: 'P.O. Box 67-30400, Baringo' },

    // Laikipia
    { id: uuidv4(), name: 'Nanyuki County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Laikipia', sub_county: 'Laikipia Central', ward: 'Nanyuki', phone: null, address: 'P.O. Box 1-10400, Nanyuki' },
    { id: uuidv4(), name: 'Nyahururu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Laikipia', sub_county: 'Laikipia West', ward: 'Nyahururu', phone: null, address: 'P.O. Box 28-10403, Nyahururu' },
    { id: uuidv4(), name: 'Dedan Kimathi Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Laikipia', sub_county: 'Laikipia East', ward: 'Dedan Kimathi', phone: null, address: 'P.O. Box 34-10401, Dedan Kimathi' },
    { id: uuidv4(), name: 'Naro Moru Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Laikipia', sub_county: 'Laikipia Central', ward: 'Naro Moru', phone: null, address: 'P.O. Box 45-10400, Naro Moru' },
    { id: uuidv4(), name: 'Timau Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Laikipia', sub_county: 'Laikipia North', ward: 'Timau', phone: null, address: 'P.O. Box 56-10402, Timau' },

    // Nakuru
    { id: uuidv4(), name: 'Nakuru Level 5 Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Nakuru', sub_county: 'Nakuru Town Central', ward: 'Township', phone: null, address: 'P.O. Box 89-20100, Nakuru' },
    { id: uuidv4(), name: 'Naivasha Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nakuru', sub_county: 'Naivasha', ward: 'Naivasha', phone: null, address: 'P.O. Box 28-20110, Naivasha' },
    { id: uuidv4(), name: 'Njoro Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nakuru', sub_county: 'Njoro', ward: 'Njoro', phone: null, address: 'P.O. Box 34-20107, Njoro' },
    { id: uuidv4(), name: 'Molo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nakuru', sub_county: 'Molo', ward: 'Molo', phone: null, address: 'P.O. Box 45-20106, Molo' },
    { id: uuidv4(), name: 'Gilgil Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nakuru', sub_county: 'Gilgil', ward: 'Gilgil', phone: null, address: 'P.O. Box 56-20116, Gilgil' },
    { id: uuidv4(), name: 'Rongai Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nakuru', sub_county: 'Rongai', ward: 'Rongai', phone: null, address: 'P.O. Box 67-20103, Rongai' },
    { id: uuidv4(), name: 'Subukia Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nakuru', sub_county: 'Subukia', ward: 'Subukia', phone: null, address: 'P.O. Box 78-20104, Subukia' },
    { id: uuidv4(), name: 'Bahati Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nakuru', sub_county: 'Bahati', ward: 'Bahati', phone: null, address: 'P.O. Box 89-20101, Bahati' },
    { id: uuidv4(), name: 'MENENGAI Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nakuru', sub_county: 'Nakuru Town North', ward: 'Menengai', phone: null, address: 'P.O. Box 100-20100, Nakuru' },

    // Narok
    { id: uuidv4(), name: 'Narok County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Narok', sub_county: 'Narok North', ward: 'Narok Town', phone: null, address: 'P.O. Box 1-20500, Narok' },
    { id: uuidv4(), name: 'Kilgoris Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Narok', sub_county: 'Kilgoris', ward: 'Kilgoris', phone: null, address: 'P.O. Box 28-20511, Kilgoris' },
    { id: uuidv4(), name: 'Loita Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Narok', sub_county: 'Loita', ward: 'Loita', phone: null, address: 'P.O. Box 34-20512, Loita' },
    { id: uuidv4(), name: 'Narok South Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Narok', sub_county: 'Narok South', ward: 'Narok South', phone: null, address: 'P.O. Box 45-20502, Narok South' },
    { id: uuidv4(), name: 'Narok West Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Narok', sub_county: 'Narok West', ward: 'Narok West', phone: null, address: 'P.O. Box 56-20503, Narok West' },
    { id: uuidv4(), name: 'Emurua Dikirr Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Narok', sub_county: 'Narok North', ward: 'Emurua Dikirr', phone: null, address: 'P.O. Box 67-20500, Narok' },

    // Kajiado
    { id: uuidv4(), name: 'Kajiado County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kajiado', sub_county: 'Kajiado Central', ward: 'Kajiado', phone: null, address: 'P.O. Box 1-25100, Kajiado' },
    { id: uuidv4(), name: 'Ngong Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kajiado', sub_county: 'Kajiado North', ward: 'Ngong', phone: null, address: 'P.O. Box 28-25103, Ngong' },
    { id: uuidv4(), name: 'Athi River Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kajiado', sub_county: 'Mavoko', ward: 'Athi River', phone: null, address: 'P.O. Box 34-00204, Athi River' },
    { id: uuidv4(), name: 'Kitengela Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kajiado', sub_county: 'Isinya', ward: 'Kitengela', phone: null, address: 'P.O. Box 45-00241, Kitengela' },
    { id: uuidv4(), name: 'Loitokitok Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kajiado', sub_county: 'Loitokitok', ward: 'Loitokitok', phone: null, address: 'P.O. Box 56-25105, Loitokitok' },
    { id: uuidv4(), name: 'Ongata Rongai Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kajiado', sub_county: 'Kajiado North', ward: 'Ongata Rongai', phone: null, address: 'P.O. Box 67-25103, Ongata Rongai' },

    // Kericho
    { id: uuidv4(), name: 'Kericho County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kericho', sub_county: 'Kericho Central', ward: 'Township', phone: null, address: 'P.O. Box 1-20200, Kericho' },
    { id: uuidv4(), name: 'Litein Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kericho', sub_county: 'Bureti', ward: 'Litein', phone: null, address: 'P.O. Box 28-20211, Litein' },
    { id: uuidv4(), name: 'Londiani Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kericho', sub_county: 'Kipkelion', ward: 'Londiani', phone: null, address: 'P.O. Box 34-20212, Londiani' },
    { id: uuidv4(), name: 'Kipkelion Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kericho', sub_county: 'Kipkelion', ward: 'Kipkelion', phone: null, address: 'P.O. Box 45-20213, Kipkelion' },
    { id: uuidv4(), name: 'Ainamoi Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kericho', sub_county: 'Ainamoi', ward: 'Ainamoi', phone: null, address: 'P.O. Box 56-20201, Ainamoi' },
    { id: uuidv4(), name: 'Soin Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kericho', sub_county: 'Sigowet/Soin', ward: 'Soin', phone: null, address: 'P.O. Box 67-20214, Soin' },

    // Bomet
    { id: uuidv4(), name: 'Bomet County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Bomet', sub_county: 'Bomet Central', ward: 'Township', phone: null, address: 'P.O. Box 1-20400, Bomet' },
    { id: uuidv4(), name: 'Longisa Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Bomet', sub_county: 'Bomet East', ward: 'Longisa', phone: null, address: 'P.O. Box 28-20402, Longisa' },
    { id: uuidv4(), name: 'Sotik Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Bomet', sub_county: 'Sotik', ward: 'Sotik', phone: null, address: 'P.O. Box 34-20403, Sotik' },
    { id: uuidv4(), name: 'Kokwet Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Bomet', sub_county: 'Bomet Central', ward: 'Kokwet', phone: null, address: 'P.O. Box 45-20400, Kokwet' },
    { id: uuidv4(), name: 'Ndaraweta Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Bomet', sub_county: 'Konoin', ward: 'Ndaraweta', phone: null, address: 'P.O. Box 56-20404, Ndaraweta' },

    // ==================== WESTERN KENYA ====================

    // Kakamega
    { id: uuidv4(), name: 'Kakamega County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kakamega', sub_county: 'Kakamega Central', ward: 'Township', phone: null, address: 'P.O. Box 1-50100, Kakamega' },
    { id: uuidv4(), name: 'Mumias Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kakamega', sub_county: 'Mumias', ward: 'Mumias', phone: null, address: 'P.O. Box 28-50110, Mumias' },
    { id: uuidv4(), name: 'Malava Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kakamega', sub_county: 'Malava', ward: 'Malava', phone: null, address: 'P.O. Box 34-50111, Malava' },
    { id: uuidv4(), name: 'Lugari Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kakamega', sub_county: 'Lugari', ward: 'Lugari', phone: null, address: 'P.O. Box 45-50112, Lugari' },
    { id: uuidv4(), name: 'Butere Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kakamega', sub_county: 'Butere', ward: 'Butere', phone: null, address: 'P.O. Box 56-50113, Butere' },
    { id: uuidv4(), name: 'Shinyalu Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kakamega', sub_county: 'Shinyalu', ward: 'Shinyalu', phone: null, address: 'P.O. Box 67-50114, Shinyalu' },
    { id: uuidv4(), name: 'Ikolomani Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kakamega', sub_county: 'Ikolomani', ward: 'Ikolomani', phone: null, address: 'P.O. Box 78-50115, Ikolomani' },
    { id: uuidv4(), name: 'Mukumu Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kakamega', sub_county: 'Kakamega East', ward: 'Mukumu', phone: null, address: 'P.O. Box 89-50100, Kakamega' },
    { id: uuidv4(), name: 'Lurambi Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kakamega', sub_county: 'Lurambi', ward: 'Lurambi', phone: null, address: 'P.O. Box 100-50101, Lurambi' },

    // Vihiga
    { id: uuidv4(), name: 'Vihiga County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Vihiga', sub_county: 'Vihiga', ward: 'Mbale', phone: null, address: 'P.O. Box 1-50300, Vihiga' },
    { id: uuidv4(), name: 'Luanda Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Vihiga', sub_county: 'Luanda', ward: 'Luanda', phone: null, address: 'P.O. Box 28-50302, Luanda' },
    { id: uuidv4(), name: 'Hamisi Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Vihiga', sub_county: 'Hamisi', ward: 'Hamisi', phone: null, address: 'P.O. Box 34-50303, Hamisi' },
    { id: uuidv4(), name: 'Sabatia Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Vihiga', sub_county: 'Sabatia', ward: 'Sabatia', phone: null, address: 'P.O. Box 45-50304, Sabatia' },
    { id: uuidv4(), name: 'Emuhaya Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Vihiga', sub_county: 'Emuhaya', ward: 'Emuhaya', phone: null, address: 'P.O. Box 56-50305, Emuhaya' },
    { id: uuidv4(), name: 'Chavhis Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Vihiga', sub_county: 'Vihiga', ward: 'Chavhis', phone: null, address: 'P.O. Box 67-50300, Vihiga' },

    // Bungoma
    { id: uuidv4(), name: 'Bungoma County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Bungoma', sub_county: 'Bungoma Central', ward: 'Township', phone: null, address: 'P.O. Box 1-50200, Bungoma' },
    { id: uuidv4(), name: 'Webuye Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Bungoma', sub_county: 'Webuye', ward: 'Webuye', phone: null, address: 'P.O. Box 28-50201, Webuye' },
    { id: uuidv4(), name: 'Kimilili Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Bungoma', sub_county: 'Kimilili', ward: 'Kimilili', phone: null, address: 'P.O. Box 34-50202, Kimilili' },
    { id: uuidv4(), name: 'Tongaren Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Bungoma', sub_county: 'Tongaren', ward: 'Tongaren', phone: null, address: 'P.O. Box 45-50203, Tongaren' },
    { id: uuidv4(), name: 'Bumula Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Bungoma', sub_county: 'Bumula', ward: 'Bumula', phone: null, address: 'P.O. Box 56-50204, Bumula' },
    { id: uuidv4(), name: 'Kanduyi Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Bungoma', sub_county: 'Kanduyi', ward: 'Kanduyi', phone: null, address: 'P.O. Box 67-50205, Kanduyi' },
    { id: uuidv4(), name: 'Chwele Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Bungoma', sub_county: 'Kanduyi', ward: 'Chwele', phone: null, address: 'P.O. Box 78-50206, Chwele' },
    { id: uuidv4(), name: 'Malakisi Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Bungoma', sub_county: 'Tongaren', ward: 'Malakisi', phone: null, address: 'P.O. Box 89-50207, Malakisi' },

    // Busia
    { id: uuidv4(), name: 'Busia County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Busia', sub_county: 'Busia Central', ward: 'Township', phone: null, address: 'P.O. Box 1-50400, Busia' },
    { id: uuidv4(), name: 'Teso North Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Busia', sub_county: 'Teso North', ward: 'Amukura', phone: null, address: 'P.O. Box 28-50402, Amukura' },
    { id: uuidv4(), name: 'Teso South Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Busia', sub_county: 'Teso South', ward: 'Malakisi', phone: null, address: 'P.O. Box 34-50403, Malakisi' },
    { id: uuidv4(), name: 'Nambale Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Busia', sub_county: 'Nambale', ward: 'Nambale', phone: null, address: 'P.O. Box 45-50404, Nambale' },
    { id: uuidv4(), name: 'Butula Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Busia', sub_county: 'Butula', ward: 'Butula', phone: null, address: 'P.O. Box 56-50405, Butula' },
    { id: uuidv4(), name: 'Funyula Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Busia', sub_county: 'Funyula', ward: 'Funyula', phone: null, address: 'P.O. Box 67-50406, Funyula' },
    { id: uuidv4(), name: 'Bukembe Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Busia', sub_county: 'Busia Central', ward: 'Bukembe', phone: null, address: 'P.O. Box 78-50400, Busia' },

    // ==================== NYANZA ====================

    // Siaya
    { id: uuidv4(), name: 'Siaya County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Siaya', sub_county: 'Alego Usonga', ward: 'Siaya', phone: null, address: 'P.O. Box 1-40600, Siaya' },
    { id: uuidv4(), name: 'Bondo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Siaya', sub_county: 'Bondo', ward: 'Bondo', phone: null, address: 'P.O. Box 28-40602, Bondo' },
    { id: uuidv4(), name: 'Rarieda Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Siaya', sub_county: 'Rarieda', ward: 'Rarieda', phone: null, address: 'P.O. Box 34-40603, Rarieda' },
    { id: uuidv4(), name: 'Gem Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Siaya', sub_county: 'Gem', ward: 'Gem', phone: null, address: 'P.O. Box 45-40604, Gem' },
    { id: uuidv4(), name: 'Ugenya Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Siaya', sub_county: 'Ugenya', ward: 'Ugenya', phone: null, address: 'P.O. Box 56-40605, Ugenya' },
    { id: uuidv4(), name: 'Ugunja Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Siaya', sub_county: 'Ugunja', ward: 'Ugunja', phone: null, address: 'P.O. Box 67-40606, Ugunja' },
    { id: uuidv4(), name: 'Yala Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Siaya', sub_county: 'Gem', ward: 'Yala', phone: null, address: 'P.O. Box 78-40607, Yala' },

    // Kisumu
    { id: uuidv4(), name: 'Kisumu County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kisumu', sub_county: 'Kisumu Central', ward: 'Township', phone: null, address: 'P.O. Box 1-40100, Kisumu' },
    { id: uuidv4(), name: 'Ahero Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisumu', sub_county: 'Kisumu West', ward: 'Ahero', phone: null, address: 'P.O. Box 28-40102, Ahero' },
    { id: uuidv4(), name: 'Kondele Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisumu', sub_county: 'Kisumu Central', ward: 'Kondele', phone: null, address: 'P.O. Box 34-40100, Kisumu' },
    { id: uuidv4(), name: 'Muhoroni Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisumu', sub_county: 'Muhoroni', ward: 'Muhoroni', phone: null, address: 'P.O. Box 45-40103, Muhoroni' },
    { id: uuidv4(), name: 'Nyando Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisumu', sub_county: 'Nyando', ward: 'Nyando', phone: null, address: 'P.O. Box 56-40104, Nyando' },
    { id: uuidv4(), name: 'Seme Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisumu', sub_county: 'Seme', ward: 'Seme', phone: null, address: 'P.O. Box 67-40105, Seme' },
    { id: uuidv4(), name: 'Kisumu East Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisumu', sub_county: 'Kisumu East', ward: 'Nyalenda', phone: null, address: 'P.O. Box 78-40101, Kisumu' },
    { id: uuidv4(), name: 'Katito Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kisumu', sub_county: 'Kisumu West', ward: 'Katito', phone: null, address: 'P.O. Box 89-40102, Katito' },

    // Homa Bay
    { id: uuidv4(), name: 'Homa Bay County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Homa Bay', sub_county: 'Homa Bay Town', ward: 'Township', phone: null, address: 'P.O. Box 1-40300, Homa Bay' },
    { id: uuidv4(), name: 'Kendu Bay Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Homa Bay', sub_county: 'Kendu Bay', ward: 'Kendu Bay', phone: null, address: 'P.O. Box 28-40302, Kendu Bay' },
    { id: uuidv4(), name: 'Mbita Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Homa Bay', sub_county: 'Mbita', ward: 'Mbita', phone: null, address: 'P.O. Box 34-40303, Mbita' },
    { id: uuidv4(), name: 'Ndhiwa Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Homa Bay', sub_county: 'Ndhiwa', ward: 'Ndhiwa', phone: null, address: 'P.O. Box 45-40304, Ndhiwa' },
    { id: uuidv4(), name: 'Rangwe Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Homa Bay', sub_county: 'Rangwe', ward: 'Rangwe', phone: null, address: 'P.O. Box 56-40305, Rangwe' },
    { id: uuidv4(), name: 'Homa Bay West Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Homa Bay', sub_county: 'Homa Bay West', ward: 'Kanyadhiang', phone: null, address: 'P.O. Box 67-40300, Homa Bay' },
    { id: uuidv4(), name: 'Kabondo Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Homa Bay', sub_county: 'Kabondo Kasipul', ward: 'Kabondo', phone: null, address: 'P.O. Box 78-40306, Kabondo' },

    // Migori
    { id: uuidv4(), name: 'Migori County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Migori', sub_county: 'Migori', ward: 'Township', phone: null, address: 'P.O. Box 1-40400, Migori' },
    { id: uuidv4(), name: 'Kuria Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Migori', sub_county: 'Kuria East', ward: 'Kuria', phone: null, address: 'P.O. Box 28-40402, Kuria' },
    { id: uuidv4(), name: 'Rongo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Migori', sub_county: 'Rongo', ward: 'Rongo', phone: null, address: 'P.O. Box 34-40403, Rongo' },
    { id: uuidv4(), name: 'Awendo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Migori', sub_county: 'Awendo', ward: 'Awendo', phone: null, address: 'P.O. Box 45-40404, Awendo' },
    { id: uuidv4(), name: 'Nyatike Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Migori', sub_county: 'Nyatike', ward: 'Nyatike', phone: null, address: 'P.O. Box 56-40405, Nyatike' },
    { id: uuidv4(), name: 'Suna West Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Migori', sub_county: 'Suna West', ward: 'Suna West', phone: null, address: 'P.O. Box 67-40406, Suna West' },
    { id: uuidv4(), name: 'Kehancha Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Migori', sub_county: 'Kuria West', ward: 'Kehancha', phone: null, address: 'P.O. Box 78-40407, Kehancha' },

    // Kisii
    { id: uuidv4(), name: 'Kisii County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Kisii', sub_county: 'Kisii Central', ward: 'Township', phone: null, address: 'P.O. Box 1-40200, Kisii' },
    { id: uuidv4(), name: 'Nyamira Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisii', sub_county: 'Nyamira', ward: 'Nyamira', phone: null, address: 'P.O. Box 28-40202, Nyamira' },
    { id: uuidv4(), name: 'Kilgoris Sub-County Hospital (Kisii)', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisii', sub_county: 'Kilgoris', ward: 'Kilgoris', phone: null, address: 'P.O. Box 34-40203, Kilgoris' },
    { id: uuidv4(), name: 'Ogembo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisii', sub_county: 'Gucha South', ward: 'Ogembo', phone: null, address: 'P.O. Box 45-40204, Ogembo' },
    { id: uuidv4(), name: 'Keroka Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisii', sub_county: 'Kisii South', ward: 'Keroka', phone: null, address: 'P.O. Box 56-40205, Keroka' },
    { id: uuidv4(), name: 'Tabaka Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisii', sub_county: 'Gucha', ward: 'Tabaka', phone: null, address: 'P.O. Box 67-40206, Tabaka' },
    { id: uuidv4(), name: 'Etago Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Kisii', sub_county: 'Gucha North', ward: 'Etago', phone: null, address: 'P.O. Box 78-40207, Etago' },
    { id: uuidv4(), name: 'Suna Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kisii', sub_county: 'Kisii East', ward: 'Suna', phone: null, address: 'P.O. Box 89-40208, Suna' },
    { id: uuidv4(), name: 'Nyabirabu Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Kisii', sub_county: 'Kisii South', ward: 'Nyabirabu', phone: null, address: 'P.O. Box 100-40209, Nyabirabu' },

    // Nyamira
    { id: uuidv4(), name: 'Nyamira County Referral Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Nyamira', sub_county: 'Nyamira', ward: 'Township', phone: null, address: 'P.O. Box 1-40500, Nyamira' },
    { id: uuidv4(), name: 'Keroka Sub-County Hospital (Nyamira)', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyamira', sub_county: 'Keroka', ward: 'Keroka', phone: null, address: 'P.O. Box 28-40502, Keroka' },
    { id: uuidv4(), name: 'Nyasiongo Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyamira', sub_county: 'Nyasiongo', ward: 'Nyasiongo', phone: null, address: 'P.O. Box 34-40503, Nyasiongo' },
    { id: uuidv4(), name: 'Nyamira West Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyamira', sub_county: 'Nyamira West', ward: 'Ekerenyo', phone: null, address: 'P.O. Box 45-40504, Ekerenyo' },
    { id: uuidv4(), name: 'Manga Sub-County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nyamira', sub_county: 'Manga', ward: 'Manga', phone: null, address: 'P.O. Box 56-40505, Manga' },
    { id: uuidv4(), name: 'Magombo Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nyamira', sub_county: 'Nyamira North', ward: 'Magombo', phone: null, address: 'P.O. Box 67-40506, Magombo' },

    // ==================== NAIROBI ====================

    // Nairobi
    { id: uuidv4(), name: 'Kenyatta National Hospital', type: 'County Referral Hospital', level: 'Level 5', county: 'Nairobi', sub_county: 'Langata', ward: 'Kenyatta', phone: null, address: 'P.O. Box 20723-00202, Nairobi' },
    { id: uuidv4(), name: 'Mbagathi County Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nairobi', sub_county: 'Langata', ward: 'Mbagathi', phone: null, address: 'P.O. Box 30126-00100, Nairobi' },
    { id: uuidv4(), name: 'Mama Lucy Kibaki Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nairobi', sub_county: 'Kasarani', ward: 'Kasarani', phone: null, address: 'P.O. Box 45844-00100, Nairobi' },
    { id: uuidv4(), name: 'Menzakii Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nairobi', sub_county: 'Kasarani', ward: 'Menzakii', phone: null, address: 'P.O. Box 12345-00100, Nairobi' },
    { id: uuidv4(), name: 'Pumwani Maternity Hospital', type: 'Sub-County Hospital', level: 'Level 4', county: 'Nairobi', sub_county: 'Starehe', ward: 'Pumwani', phone: null, address: 'P.O. Box 30089-00100, Nairobi' },
    { id: uuidv4(), name: 'Dandora Community Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nairobi', sub_county: 'Kasarani', ward: 'Dandora', phone: null, address: 'P.O. Box 56789-00100, Nairobi' },
    { id: uuidv4(), name: 'Kibera Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nairobi', sub_county: 'Langata', ward: 'Kibera', phone: null, address: 'P.O. Box 67890-00100, Nairobi' },
    { id: uuidv4(), name: 'Mathare North Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nairobi', sub_county: 'Kasarani', ward: 'Mathare', phone: null, address: 'P.O. Box 78901-00100, Nairobi' },
    { id: uuidv4(), name: 'Eastleigh Health Centre', type: 'Health Centre', level: 'Level 3', county: 'Nairobi', sub_county: 'Kamukunji', ward: 'Eastleigh', phone: null, address: 'P.O. Box 89012-00100, Nairobi' },
  ];

  const newRows = rows.filter((r) => !existingCounties.includes(r.county));
  if (newRows.length) {
    await knex('referral_facilities').insert(newRows);
  }
};
