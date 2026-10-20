/**
 * Curated ancient manuscripts dataset and presets for LONTAR.ai
 */

export const SAMPLES = [
  {
    title: 'Lontar Surya Kencana — Lempeng I',
    ancientText: 'ꦱꦶꦤꦸꦮꦸꦤ꧀ ꦱꦸꦂꦪ ꦧꦸꦩꦶ',
    transliteration: '"Sinuhun surya bumi"',
    translation: 'Sinar matahari menyinari bumi dengan hangat, memberi kehidupan pada semua makhluk semesta.',
    philosophical: 'Simbol kepemimpinan adiluhung yang mengayomi segenap rakyat tanpa pilih kasih.',
    language: 'Aksara Jawa · Ron Tal Abad XVI',
    language_short: 'Aksara Jawa',
    confidence: 99.2,
    glyphs: [
      { char: 'ꦱꦶ', roman: 'Si', type: 'Sandhangan Swara Wulu', desc: 'Aksara Nglegena "Sa" (ꦱ) dipasangi sandhangan swara "Wulu" (ꦶ) yang mengubah vokal /a/ menjadi /i/.' },
      { char: 'ꦤꦸ', roman: 'Nu', type: 'Sandhangan Swara Suku', desc: 'Aksara Nglegena "Na" (ꦤ) dipasangi sandhangan swara "Suku" (ꦸ) yang mengubah vokal /a/ menjadi /u/.' },
      { char: 'ꦮꦸ', roman: 'Wu', type: 'Sandhangan Swara Suku', desc: 'Aksara Nglegena "Wa" (ꦮ) dipasangi sandhangan swara "Suku" (ꦸ) menghasilkan suku kata /wu/.' },
      { char: 'ꦤ꧀', roman: 'n', type: 'Panyigeg Pangkon', desc: 'Aksara Nglegena "Na" (ꦤ) dimatikan vokalnya dengan tanda "Pangkon" (꧀) menjadi konsonan penutup /n/.' },
      { char: 'ꦱꦸꦂ', roman: 'Sur', type: 'Suku & Layar', desc: 'Aksara Nglegena "Sa" (ꦱ) dipasangi sandhangan "Suku" (ꦸ) dan panyigeg "Layar" (ꦂ) menghasilkan suku tertutup /sur/.' },
      { char: 'ꦪ', roman: 'Ya', type: 'Aksara Nglegena', desc: 'Aksara konsonan dasar "Ya" (ꦪ) dengan vokal inheren terbuka /ya/.' },
      { char: 'ꦧꦸ', roman: 'Bu', type: 'Sandhangan Swara Suku', desc: 'Aksara Nglegena "Ba" (ꦧ) dipasangi sandhangan swara "Suku" (ꦸ) menghasilkan suku kata /bu/.' },
      { char: 'ꦩꦶ', roman: 'Mi', type: 'Sandhangan Swara Wulu', desc: 'Aksara Nglegena "Ma" (ꦩ) dipasangi sandhangan swara "Wulu" (ꦶ) menghasilkan suku kata /mi/.' }
    ],
    lexicon: [
      { term: 'Sinuhun', origin: 'Jawa Kuno / Jawa Pertengahan', meaning: 'Yang dijunjung tinggi / junjungan mulia; gelar adiluhung bagi pemimpin yang mengayomi seluruh rakyat.' },
      { term: 'Surya', origin: 'Sanskerta (sūrya)', meaning: 'Matahari; simbol kehangatan, penerangan jagad semesta, dan keadilan tanpa pilih kasih.' },
      { term: 'Bumi', origin: 'Sanskerta (bhūmi)', meaning: 'Tanah air, persada semesta, serta ruang bernaung segenap titah kehidupan.' }
    ]
  },
  {
    title: 'Kakawin Sutasoma — Pupuh 139',
    ancientText: 'ꦨꦶꦤ꧀ꦤꦺꦏ ꦠꦸꦁꦒꦭ꧀ ꦲꦶꦏ',
    transliteration: '"Bhinneka Tunggal Ika tan hana dharma mangrwa"',
    translation: 'Berbeda-beda tetapi tetap satu jua, tiada kebenaran yang mendua di alam semesta.',
    philosophical: 'Fondasi luhur Mpu Tantular tentang persatuan sejati dalam keberagaman nusantara.',
    language: 'Kawi / Jawa Kuno · Abad XIV Majapahit',
    language_short: 'Kawi / Jawa Kuno',
    confidence: 99.5,
    glyphs: [
      { char: 'ꦨꦶ', roman: 'Bhi', type: 'Aksara Murda Mahaprana', desc: 'Aksara Murda agung "Bha" (ꦨ) dipasangi sandhangan "Wulu" (ꦶ) melambangkan keagungan entitas tertinggi.' },
      { char: 'ꦤ꧀ꦤꦺ', roman: 'Nne', type: 'Pasangan & Taling', desc: 'Aksara "Na" (ꦤ) disusul Pasangan "Na" (꧀ꦤ) dan Sandhangan "Taling" (ꦺ) berbunyi ganda /nne/.' },
      { char: 'ꦏ', roman: 'Ka', type: 'Aksara Nglegena', desc: 'Aksara konsonan dasar "Ka" (ꦏ) dengan vokal inheren /ka/.' },
      { char: 'ꦠꦸꦁ', roman: 'Tung', type: 'Suku & Cecak', desc: 'Aksara "Ta" (ꦠ) + Suku (ꦸ) + Sandhangan panyigeg Cecak (ꦁ) menghasilkan bunyi sengau /tung/.' },
      { char: 'ꦒ', roman: 'Ga', type: 'Aksara Nglegena', desc: 'Aksara konsonan dasar "Ga" (ꦒ) dengan vokal inheren /ga/.' },
      { char: 'ꦭ꧀', roman: 'l', type: 'Panyigeg Pangkon', desc: 'Aksara "La" (ꦭ) disusul tanda "Pangkon" (꧀) mematikan vokal suku kata menjadi konsonan /l/.' },
      { char: 'ꦲꦶ', roman: 'I', type: 'Sandhangan Swara', desc: 'Aksara "Ha" (ꦲ) dipasangi sandhangan "Wulu" (ꦶ) yang melafalkan vokal swara murni /i/.' },
      { char: 'ꦏ', roman: 'Ka', type: 'Aksara Nglegena', desc: 'Aksara konsonan dasar "Ka" (ꦏ) dengan vokal inheren /ka/.' }
    ],
    lexicon: [
      { term: 'Bhinneka', origin: 'Jawa Kuno (bhinna + ika)', meaning: 'Berbeda-beda itu; kendati tampak beraneka bentuk luarnya, hakikatnya berpangkal pada satu esensi kosmis.' },
      { term: 'Tunggal', origin: 'Austronesia / Jawa Kuno', meaning: 'Satu, esa, manunggal secara utuh tanpa keterpisahan.' },
      { term: 'Ika', origin: 'Jawa Kuno / Kawi', meaning: 'Itu / demikianlah hakikat kebenarannya.' },
      { term: 'Tan hana', origin: 'Jawa Kuno', meaning: 'Tiada / mustahil ada kontradiksi.' },
      { term: 'Mangrwa', origin: 'Jawa Kuno (ma- + rwa)', meaning: 'Mendua atau terpecah belah; esensi dharma kebenaran tidak pernah berselisih.' }
    ]
  },
  {
    title: 'Prasasti Batavia — Huruf Kawi Museum',
    ancientText: `𑀲𑀼𑀩𑀲𑁆𑀢𑀼𑀦𑀫𑀄𑀰𑀺𑀯𑀢𑀺𑀢𑀃𑀞𑀫𑀘𑀡𑀢𑀡𑀰𑀶𑀰𑁆𑀫𑀲𑀳𑀓𑁆𑀰𑀷𑀻𑀚𑀻𑀧𑀼
𑀫𑀺𑀓𑁆𑀢𑀼𑀧𑀼𑀲𑁆𑀬𑀸𑀳𑀸𑀭𑀸𑀫𑀸𑀘𑀸𑀭𑀸𑀫𑀸𑀥𑀼𑀢𑀻𑀥𑀸𑀬𑀼𑀪𑀸𑀬𑀼𑀪𑀼𑀬𑀼𑀲𑀸𑀭𑀸
𑀭𑀸𑀳𑀺𑀫𑀺𑀢ꦏ꧀ꦟꦷꦰ꧀ꦭꦷꦥꦸꦠꦧꦢꦶꦱꦘꦢꦫꦴꦩꦩꦕꦫꦧ꧀ꦭꦫꦸꦭꦴꦱꦸ
𑀯𑀺ꦕ꧀ꦕꦶꦧ꧀ꦮꦴꦩꦴꦠꦱꦴꦭ꧀ꦪꦸꦩꦸꦧ꧀ꦢ꧀ꦮꦩꦴꦪꦩꦢꦶꦭꦴꦩꦴꦱꦴ
ꦏꦕ꧀ꦪꦴꦢꦶꦏꦴꦢꦶꦩꦴꦠꦶꦤꦴꦪꦱꦶꦠ꧀ꦩꦫꦸꦮꦴꦭꦶꦢ꧀ꦮꦴꦠꦥꦸꦢꦶꦠꦏ꧀ꦟꦸꦧꦱ
𑀰𑁆ꦭꦻꦪꦸꦢꦴꦏ꧀ꦏꦢꦴꦩꦲꦶꦩꦷꦱꦮꦠꦴꦟꦶꦮꦢꦶꦏꦴꦠꦏ꧀ꦱꦴꦭꦴꦩꦴꦱꦴꦩꦴꦠꦷꦭꦶ
ꦱꦷꦩꦏꦷꦭꦱꦸꦥꦶꦠꦏꦮꦴꦫꦴꦟꦠꦸꦪ꧀ꦟ꧀ꦩꦴꦪꦸꦩꦴꦪꦪꦮꦸꦢ꧀ꦪꦸꦢ꧀ꦥꦸ
ꦪꦩꦴꦭꦷꦠꦏꦩꦸꦲ꧀ꦤꦷꦠꦴꦱꦶꦪꦴꦩꦴꦠꦱꦷꦢ꧀ꦒꦠꦩꦱꦷꦩꦷꦢꦶꦏꦩꦴꦯꦸ
ꦠꦴꦏꦱꦷꦢ꧀ꦒꦸꦩ꧀ꦧꦷꦪꦸꦩꦴꦠꦸꦏꦴꦒꦹꦏꦢꦏ`,
    transliteration: `swastyastu namaḥ śiwatita tha ma ca ṇa ta ṇa ṣa ṣa śa ma sa ha kṣa ṇī jī pu
miktupusyāhārāmācārāmādhūtīdhāyubhāyubhuyusārā
rāhimitakṇīśrīputabadisacadarāmamacarablarulāsu
viccibvāmātasālyumubdvamāyamadilāmāsā
kacyādikādimātināyasitmaruvālidvātapuditakṇubasa
śriyudākzkadamahimanasavatāṇīvadikātaksālāmāsāmātīli
sīmakīlasupitakavārāṇatuyṇmāyumāyabhavudbhudpu
yamālītakamuhnītāsiyāmātasīdgatamasīmīdikamāśu
tākasīdgumbīyumātukāgūkādaka`,
    translation: `Semoga selamatlah, sembah sujud kepada Sang Hyang Siwa Mahatinggi. Naskah prasasti peraga ini memuat deretan kaidah pembentukan kata, konjungsi vokal, dan formula aksara Kawi lengkap untuk penetapan wilayah (sīma) serta puji-pujian keluhuran budi para leluhur Nusantara.`,
    philosophical: `Lembar peraga epigrafi Kawi dari salah satu prasasti kuno Batavia, melambangkan kekayaan tradisi literasi aksara Nusantara abad VIII–X Masehi.`,
    language: 'Aksara Kawi · Abad VIII–X M',
    language_short: 'Aksara Kawi',
    confidence: 99.4,
    lexicon: [
      { term: 'Swastyastu', origin: 'Sanskerta (su + asti + astu)', meaning: 'Semoga ada dalam keselamatan lahir-batin dan kedamaian mutlak semesta.' },
      { term: 'Namaḥ Śiwāya', origin: 'Sanskerta', meaning: 'Sembah sujud pemujaan kepada Hyang Siwa Mahatinggi pelindung tatanan kosmis.' },
      { term: 'Varṇamālā', origin: 'Sanskerta', meaning: 'Untaian aksara vokal-konsonan peraga silabis Kawi kuno.' },
      { term: 'Sīma', origin: 'Sanskerta / Jawa Kuno', meaning: 'Tanah perdikan suci berkekuatan hukum tetap yang bebas dari pajak kerajaan.' }
    ]
  },
  {
    title: 'Prasasti Sukamerta — Lempeng III',
    ancientText: 'ꦱꦶꦢ꧀ꦣꦶ ꦫꦱ꧀ꦠꦸ',
    transliteration: '"Siddhi rastu tatastu astu"',
    translation: 'Semoga berhasil dan dilimpahi keselamatan bagi segenap warga serta generasi penerus bangsa.',
    philosophical: 'Doa agung para leluhur memohon kemakmuran dan perlindungan tanah air.',
    language: 'Jawa Kuno · Piagam 1296 M',
    language_short: 'Jawa Kuno',
    confidence: 98.7,
    glyphs: [
      { char: 'ꦱꦶ', roman: 'Si', type: 'Sandhangan Swara Wulu', desc: 'Aksara Nglegena "Sa" (ꦱ) dipasangi "Wulu" (ꦶ) menghasilkan vokal /si/.' },
      { char: 'ꦢ꧀ꦣꦶ', roman: 'Ddhi', type: 'Pasangan Mahaprana', desc: 'Aksara "Da" (ꦢ) dipasangi Pasangan Mahaprana "Dha" (꧀ꦣ) dan Wulu (ꦶ) bermakna kesempurnaan batin.' },
      { char: 'ꦫ', roman: 'Ra', type: 'Aksara Nglegena', desc: 'Aksara dasar "Ra" (ꦫ) dengan vokal inheren /ra/.' },
      { char: 'ꦱ꧀ꦠꦸ', roman: 'Stu', type: 'Pasangan & Suku', desc: 'Aksara "Sa" (ꦱ) disusul Pasangan "Ta" (꧀ꦠ) dan Suku (ꦸ) berbunyi /stu/, formula doa sakral leluhur.' }
    ],
    lexicon: [
      { term: 'Siddhi', origin: 'Sanskerta', meaning: 'Pencapaian sempurna, kemanjuran spiritual, dan keberhasilan agung.' },
      { term: 'Rastu', origin: 'Sanskerta (astu)', meaning: 'Semoga demikianlah adanya / semoga terkabulkan.' },
      { term: 'Tatastu', origin: 'Sanskerta (tata + astu)', meaning: 'Jadilah demikian selaras tatanan kosmis semesta.' }
    ]
  },
];

export const DEFAULT_HISTORY = [
  {
    id: 'init-1',
    title: 'Kakawin Sutasoma — Pupuh 139',
    date: '18 Okt 2026 • 14:20',
    ancientText: 'ꦨꦶꦤ꧀ꦤꦺꦏ ꦠꦸꦁꦒꦭ꧀ ꦲꦶꦏ',
    transliteration: '"Bhinneka Tunggal Ika"',
    translation: 'Berbeda-beda tetapi tetap satu jiwa, tiada kebenaran yang mendua.',
    philosophical: 'Prinsip toleransi dan persatuan adiluhung sebagai fondasi keberagaman nusantara.',
    language: 'Kawi / Jawa Kuno · Abad XIV',
    language_short: 'Kawi / Jawa Kuno',
    confidence: 99.5,
    glyphs: SAMPLES[1].glyphs,
    lexicon: SAMPLES[1].lexicon,
  },
  {
    id: 'init-2',
    title: 'Prasasti Batavia — Huruf Kawi Museum',
    date: '20 Okt 2026 • 16:45',
    ancientText: SAMPLES[2].ancientText,
    transliteration: SAMPLES[2].transliteration,
    translation: SAMPLES[2].translation,
    philosophical: SAMPLES[2].philosophical,
    language: SAMPLES[2].language,
    language_short: SAMPLES[2].language_short,
    confidence: SAMPLES[2].confidence,
    lexicon: SAMPLES[2].lexicon,
  },
  {
    id: 'init-3',
    title: 'Prasasti Sukamerta — Lempeng III',
    date: '15 Okt 2026 • 09:45',
    ancientText: 'ꦱꦶꦢ꧀ꦣꦶ ꦫꦱ꧀ꦠꦸ',
    transliteration: '"Siddhi rastu"',
    translation: 'Semoga berhasil dan diberkahi keselamatan bagi segenap warga desa serta generasi penerus.',
    philosophical: 'Doa pembuka untuk keberkahan tanah air dan ketenteraman masyarakat Nusantara.',
    language: 'Jawa Kuno · Abad XIII',
    language_short: 'Jawa Kuno',
    confidence: 98.7,
    glyphs: SAMPLES[3].glyphs,
    lexicon: SAMPLES[3].lexicon,
  },
];

export const VOICE_TEMPOS = [
  { rate: 0.88, label: '0.9x Khidmat' },
  { rate: 1.0, label: '1.0x Standar' },
  { rate: 1.15, label: '1.2x Ringkas' },
];
