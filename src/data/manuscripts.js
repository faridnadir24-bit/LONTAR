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
    glyphs: [
      { char: '𑀲𑀼', roman: 'Su', type: 'Vokal Suku Kawi', desc: 'Aksara Kawi dasar "Sa" (𑀲) dipasangi tanda vokal u (Suku) berbunyi /su/.' },
      { char: '𑀩', roman: 'Ba', type: 'Aksara Dasar', desc: 'Konsonan labial Kawi murni "Ba" dengan vokal inheren terbuka /ba/.' },
      { char: '𑀲𑁆𑀢𑀼', roman: 'Stu', type: 'Konjungsi Pasangan', desc: 'Aksara "Sa" disusul konjungsi "Ta" dan vokal u menghasilkan formula doa sakral /stu/.' },
      { char: '𑀦', roman: 'Na', type: 'Aksara Dasar', desc: 'Konsonan dental Kawi murni "Na" berbunyi /na/.' },
      { char: '𑀫', roman: 'Ma', type: 'Aksara Dasar', desc: 'Konsonan labial "Ma" bagian dari formula sembah pemujaan /namaḥ/.' },
      { char: '𑀰𑀺', roman: 'Śi', type: 'Sandhangan Swara', desc: 'Aksara palatal Kawi "Śa" dipasangi vokal i merujuk nama agung Hyang Siwa.' },
      { char: '𑀯', roman: 'Wa', type: 'Aksara Dasar', desc: 'Konsonan semivokal labiodental Kawi "Wa".' },
      { char: '𑀢', roman: 'Ta', type: 'Aksara Dasar', desc: 'Konsonan dental tak bersuara "Ta" dalam formula aksara naskah.' }
    ],
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
  {
    title: 'Prasasti Kawali — Astana Gede',
    ancientText: 'ᮔᮤᮠᮔ᮪ ᮒᮕᮊ᮪ ᮝᮜᮎ᮪ ᮞᮥᮔ᮪ᮓ',
    transliteration: '"Nihan tapak walac sunda"',
    translation: 'Inilah tanda jejak kejayaan tanah Sunda yang dimuliakan para leluhur.',
    philosophical: 'Ajaran luhur Prabu Niskala Wastu Kancana tentang ketenteraman dan kemakmuran negeri Parahyangan.',
    language: 'Aksara Sunda Kuno · Abad XIV',
    language_short: 'Aksara Sunda Kuno',
    confidence: 99.3,
    glyphs: [
      { char: 'ᮔᮤ', roman: 'Ni', type: 'Rarangken Panghulu', desc: 'Aksara ngalagena "Na" (ᮔ) dipasangi rarangken "Panghulu" (ᮤ) menghasilkan vokal /ni/.' },
      { char: 'ᮠ', roman: 'Ha', type: 'Aksara Ngalagena', desc: 'Konsonan dasar Sunda "Ha" (ᮠ) berbunyi /ha/.' },
      { char: 'ᮔ᮪', roman: 'n', type: 'Panyigeg Pamaeh', desc: 'Aksara "Na" (ᮔ) dimatikan vokalnya dengan "Pamaeh" (᮪) menjadi konsonan penutup /n/.' },
      { char: 'ᮒ', roman: 'Ta', type: 'Aksara Ngalagena', desc: 'Konsonan dasar Sunda "Ta" (ᮒ).' },
      { char: 'ᮕ', roman: 'Pa', type: 'Aksara Ngalagena', desc: 'Konsonan dasar Sunda "Pa" (ᮕ).' },
      { char: 'ᮊ᮪', roman: 'k', type: 'Panyigeg Pamaeh', desc: 'Aksara "Ka" (ᮊ) dimatikan vokalnya dengan "Pamaeh" (᮪) berbunyi /k/.' },
      { char: 'ᮝ', roman: 'Wa', type: 'Aksara Ngalagena', desc: 'Konsonan dasar Sunda "Wa" (ᮝ).' },
      { char: 'ᮜ', roman: 'La', type: 'Aksara Ngalagena', desc: 'Konsonan dasar Sunda "La" (ᮜ).' },
      { char: 'ᮞᮥ', roman: 'Su', type: 'Rarangken Panyuku', desc: 'Aksara "Sa" (ᮞ) dipasangi rarangken "Panyuku" (ᮥ) menghasilkan vokal /su/.' },
      { char: 'ᮔ᮪ᮓ', roman: 'Nda', type: 'Pasangan Ngalagena', desc: 'Aksara "Na" (ᮔ) disusul "Da" (ᮓ) membentuk gabungan suku kata sengau /nda/.' }
    ],
    lexicon: [
      { term: 'Nihan', origin: 'Sunda Kuno', meaning: 'Inilah / sesungguhnya demikian halnya.' },
      { term: 'Tapak', origin: 'Austronesia / Sunda Kuno', meaning: 'Jejak tapak langkah kebajikan dan karya agung kepemimpinan.' },
      { term: 'Walac', origin: 'Sunda Kuno', meaning: 'Tanda prasasti / piagam suci ketetapan hukum.' },
      { term: 'Sunda', origin: 'Sunda Kuno / Sanskerta (suddha/cunda)', meaning: 'Cahaya putih bersih, suci, dan permai.' }
    ]
  },
  {
    title: 'Kakawin Arjuna Wiwaha — Lontar Bali',
    ancientText: 'ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ ᬦᬫᭀ ᬲᬶᬤ᭄ᬥᬫ᭄',
    transliteration: '"Om awighnamastu namo siddham"',
    translation: 'Ya Tuhan, semoga tiada rintangan rintangan dan tercapailah keberhasilan sempurna.',
    philosophical: 'Doa agung pembuka karya sastra kakawin klasik yang memohon perlindungan dari Sang Hyang Saraswati dan Sang Hyang Widhi.',
    language: 'Aksara Bali · Kawi Bali Abad XI',
    language_short: 'Aksara Bali',
    confidence: 99.6,
    glyphs: [
      { char: 'ᬑᬁ', roman: 'Om', type: 'Aksara Pranava Suci', desc: 'Syllable kosmis agung "Omkara" lambang kesucian tertinggi alam semesta.' },
      { char: 'ᬅ', roman: 'A', type: 'Aksara Swara', desc: 'Vokal mandiri murni /a/ dalam aksara Swalalita Bali.' },
      { char: 'ᬯᬶ', roman: 'Wi', type: 'Sandhangan Ulu', desc: 'Aksara "Wa" (ᬯ) dipasangi sandhangan swara "Ulu" (ᬶ) berbunyi /wi/.' },
      { char: 'ᬖ᭄ᬦ', roman: 'Ghna', type: 'Gantungan Mahaprana', desc: 'Aksara Mahaprana "Gha" (ᬖ) disusul gantungan "Na" (᭄ᬦ) berbunyi /ghna/ (rintangan).' },
      { char: 'ᬫ', roman: 'Ma', type: 'Aksara Wreastra', desc: 'Konsonan dasar Bali "Ma" (ᬫ).' },
      { char: 'ᬲ᭄ᬢᬸ', roman: 'Stu', type: 'Gantungan & Suku', desc: 'Aksara "Sa" (ᬲ) + gantungan "Ta" (᭄ᬢ) + vokal Suku (ᬸ) berbunyi /stu/ (semoga terkabul).' },
      { char: 'ᬦ', roman: 'Na', type: 'Aksara Wreastra', desc: 'Konsonan dasar Bali "Na" (ᬦ).' },
      { char: 'ᬫᭀ', roman: 'Mo', type: 'Tedong Taling', desc: 'Aksara "Ma" (ᬫ) dipasangi sandhangan "Taling Tedong" (ᭀ) berbunyi /mo/.' },
      { char: 'ᬲᬶ', roman: 'Si', type: 'Sandhangan Ulu', desc: 'Aksara "Sa" (ᬲ) dipasangi "Ulu" (ᬶ) berbunyi /si/.' },
      { char: 'ᬤ᭄ᬥ', roman: 'Ddha', type: 'Gantungan Mahaprana', desc: 'Aksara "Da" (ᬤ) dipasangi gantungan mahaprana "Dha" (᭄ᬥ) bermakna kesempurnaan.' }
    ],
    lexicon: [
      { term: 'Awighnamastu', origin: 'Sanskerta (a- + vighna + astu)', meaning: 'Semoga tiada aral melintang atau halangan dalam melangkah.' },
      { term: 'Namo', origin: 'Sanskerta (namaḥ)', meaning: 'Sembah sujud penuh rasa takzim ke hadirat Sang Pencipta.' },
      { term: 'Siddham', origin: 'Sanskerta', meaning: 'Pencapaian sempurna yang telah tuntas dan terwujud.' }
    ]
  },
  {
    title: 'Pustaha Laklak Batak — Datu Poda',
    ancientText: 'ᯅᯉᯪ ᯀᯂᯮ ᯔᯉᯮᯄ᯦᯲ ᯎᯮᯒ᯲ᯑᯰ',
    transliteration: '"Bani ahu manuk gurdang sitiktik tano"',
    translation: 'Inilah petuah pusaka datu tentang tatanan harmoni dan perlindungan semesta.',
    philosophical: 'Kearifan ekologis suku Batak mengenai keseimbangan kosmologi antara manusia, hutan, tanah, dan pencipta (Mulajadi Na Bolon).',
    language: 'Surat Batak · Toba / Laklak',
    language_short: 'Surat Batak',
    confidence: 99.1,
    glyphs: [
      { char: 'ᯅ', roman: 'Ba', type: 'Ina ni Surat', desc: 'Konsonan dasar Batak "Ba" (ᯅ) berbunyi /ba/.' },
      { char: 'ᯉᯪ', roman: 'Ni', type: 'Anak ni Surat Haluan', desc: 'Aksara "Na" (ᯉ) dipasangi diakritik "Haluan" (ᯪ) yang mengubah vokal menjadi /ni/.' },
      { char: 'ᯀ', roman: 'A', type: 'Ina ni Surat', desc: 'Vokal mandiri murni /a/ dalam tradisi Surat Batak.' },
      { char: 'ᯂᯮ', roman: 'Hu', type: 'Anak ni Surat Sihorhor', desc: 'Aksara "Ha" (ᯂ) dipasangi anak surat "Sihorhor" (ᯮ) berbunyi /hu/.' },
      { char: 'ᯔ', roman: 'Ma', type: 'Ina ni Surat', desc: 'Konsonan dasar Batak "Ma" (ᯔ).' },
      { char: 'ᯉᯮ', roman: 'Nu', type: 'Anak ni Surat Sihorhor', desc: 'Aksara "Na" (ᯉ) dipasangi "Sihorhor" (ᯮ) berbunyi /nu/.' },
      { char: 'ᯄ᯦᯲', roman: 'k', type: 'Anak ni Surat Pangolat', desc: 'Aksara "Ka" (ᯄ) dimatikan vokalnya dengan tanda "Pangolat" (᯲) menjadi konsonan penutup /k/.' },
      { char: 'ᯎᯮ', roman: 'Gu', type: 'Anak ni Surat Sihorhor', desc: 'Aksara "Ga" (ᯎ) dipasangi "Sihorhor" (ᯮ) berbunyi /gu/.' },
      { char: 'ᯒ᯲', roman: 'r', type: 'Anak Surat Haborotan', desc: 'Aksara "Ra" (ᯒ) dimatikan menjadi konsonan penutup /r/.' },
      { char: 'ᯑᯰ', roman: 'Dang', type: 'Anak ni Surat Paminggil', desc: 'Aksara "Da" (ᯑ) dipasangi sengau "Paminggil" (ᯰ) berbunyi /dang/.' }
    ],
    lexicon: [
      { term: 'Bani', origin: 'Batak (hata datu)', meaning: 'Kepada / peruntukan wejangan suci ini.' },
      { term: 'Ahu', origin: 'Austronesia / Batak', meaning: 'Aku / jati diri sang pencari kearifan.' },
      { term: 'Manuk Gurdang', origin: 'Batak', meaning: 'Burung mitologis perlambang kewaspadaan, pertanda kosmis, dan penjaga tanah.' },
      { term: 'Poda', origin: 'Batak', meaning: 'Wejangan moral, petuah adiluhung yang diwariskan turun-temurun.' }
    ]
  },
  {
    title: 'Sureq Galigo — I La Galigo Bugis',
    ancientText: 'ᨕᨗᨐᨊ ᨔᨙᨓ ᨒᨚᨈᨚ ᨄᨈᨘᨑᨗᨐᨚᨒᨚ',
    transliteration: '"Iyana sewwa lonto patturioloang"',
    translation: 'Inilah lembaran hikayat peradaban masa silam di tanah Bugis yang menjunjung tinggi martabat.',
    philosophical: 'Falsafah siri\' na pesse dalam epos terpanjang dunia, mengajarkan kehormatan diri, kesetiakawanan, dan keutamaan budi pekerti.',
    language: 'Aksara Lontara · Basa Ugi Abad XIV',
    language_short: 'Aksara Lontara',
    confidence: 99.4,
    glyphs: [
      { char: 'ᨕᨗ', roman: 'I', type: 'Ana\' Sureq Tetti\' Riase\'', desc: 'Aksara dasar "A" (ᨕ) dipasangi titik di atas "Tetti\' riase\'" (ᨗ) berbunyi /i/.' },
      { char: 'ᨐ', roman: 'Ya', type: 'Aksara Sulapa Eppa', desc: 'Konsonan dasar Bugis "Ya" (ᨐ) berbentuk belah ketupat.' },
      { char: 'ᨊ', roman: 'Na', type: 'Aksara Sulapa Eppa', desc: 'Konsonan dasar Bugis "Na" (ᨊ).' },
      { char: 'ᨔᨙ', roman: 'Se', type: 'Ana\' Sureq Taling', desc: 'Aksara "Sa" (ᨔ) dipasangi diakritik "Taling" (ᨙ) berbunyi /se/.' },
      { char: 'ᨓ', roman: 'Wa', type: 'Aksara Sulapa Eppa', desc: 'Konsonan dasar Bugis "Wa" (ᨓ).' },
      { char: 'ᨒᨚ', roman: 'Lo', type: 'Ana\' Sureq Tecceng', desc: 'Aksara "La" (ᨒ) dipasangi diakritik "Tecceng" (ᨚ) berbunyi /lo/.' },
      { char: 'ᨈᨚ', roman: 'To', type: 'Ana\' Sureq Tecceng', desc: 'Aksara "Ta" (ᨈ) dipasangi diakritik "Tecceng" (ᨚ) berbunyi /to/.' },
      { char: 'ᨄ', roman: 'Pa', type: 'Aksara Sulapa Eppa', desc: 'Konsonan dasar Bugis "Pa" (ᨄ).' },
      { char: 'ᨑᨗ', roman: 'Ri', type: 'Ana\' Sureq Tetti\' Riase\'', desc: 'Aksara "Ra" (ᨑ) dipasangi titik atas (ᨗ) berbunyi /ri/.' }
    ],
    lexicon: [
      { term: 'Iyana', origin: 'Bugis (basa Ugi)', meaning: 'Inilah / sesungguhnya demikian perkaranya.' },
      { term: 'Sewwa', origin: 'Bugis', meaning: 'Satu / suatu ketetapan yang tunggal.' },
      { term: 'Patturioloang', origin: 'Bugis (pariolo)', meaning: 'Kisah para leluhur / adat kebiasaan tatanan masa lampau.' },
      { term: 'Siri\'', origin: 'Bugis / Makassar', meaning: 'Kehormatan diri, harga diri luhur, dan martabat moral kemanusiaan.' }
    ]
  },
  {
    title: 'Kitab Pegon Melayu-Jawa',
    ancientText: 'بِسْمِ اللَّهِ نِيَاتْ اِينْغْسُونْ اَنْجَاݢَا كَبَاجِيقَانْ',
    transliteration: '"Bismillah niyat ingsun anjaga kabajikan ing bhuwana"',
    translation: 'Dengan menyebut nama Tuhan yang Maha Pengasih, teguh niatku menjaga kebajikan di persada bumi.',
    philosophical: 'Sintesis harmonis ajaran spiritual Islam dengan kearifan lokal Nusantara dalam memelihara keluhuran pekerti.',
    language: 'Aksara Pegon · Tradisi Pesantren',
    language_short: 'Aksara Pegon',
    confidence: 99.3,
    glyphs: [
      { char: 'بِ', roman: 'Bi', type: 'Harakat Kasrah', desc: 'Konsonan Ba berharakat Kasrah berbunyi /bi/.' },
      { char: 'سْ', roman: 's', type: 'Sukun', desc: 'Konsonan Sin berharakat Sukun mematikan vokal /s/.' },
      { char: 'مِ', roman: 'Mi', type: 'Harakat Kasrah', desc: 'Konsonan Mim berharakat Kasrah /mi/.' },
      { char: 'نِيَ', roman: 'Niya', type: 'Konsonan & Vokal', desc: 'Konsonan Nun dan Ya membentuk suku kata /niya/.' },
      { char: 'تْ', roman: 't', type: 'Tanda Mati Sukun', desc: 'Konsonan Ta bertanda Sukun penutup kata /t/.' },
      { char: 'اِي', roman: 'I', type: 'Alif Ya', desc: 'Vokal panjang awal kata /i/ dalam ortografi Pegon.' },
      { char: 'ڠ', roman: 'Nga', type: 'Huruf Rekaan Nusantara', desc: 'Konsonan khas Pegon/Jawi "Nga" (Ain bertitik tiga di atas).' },
      { char: 'ݢ', roman: 'Ga', type: 'Huruf Rekaan Nusantara', desc: 'Konsonan khas Pegon/Jawi "Ga" (Kaf bertitik satu di atas).' }
    ],
    lexicon: [
      { term: 'Bismillah', origin: 'Arab (bi + ismi + Allah)', meaning: 'Dengan menyebut nama Allah yang Maha Pengasih lagi Maha Penyayang.' },
      { term: 'Niyat ingsun', origin: 'Jawa Kuno / Jawa Pertengahan', meaning: 'Tekad tulus dari lubuk jiwaku.' },
      { term: 'Kabajikan', origin: 'Jawa / Melayu Kuno', meaning: 'Kebaikan sejati yang membawa maslahat bagi sesama makhluk.' },
      { term: 'Bhuwana', origin: 'Sanskerta / Jawa Kuno', meaning: 'Jagat semesta persada bumi kehidupan.' }
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
    glyphs: SAMPLES[2].glyphs,
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
