import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatScanDate,
  createHistoryItem,
  filterHistory,
  prepareSpeechPayload,
  validateScanInput,
  cleanManuscriptText,
  detectScriptFromUnicode,
  resolveLanguageAttribution,
  INITIAL_MOCK_HISTORY,
} from './lontarLogic.ts';

test('formatScanDate formats date reliably', () => {
  const date = new Date(2026, 9, 19, 14, 30);
  const formatted = formatScanDate(date);
  assert.match(formatted, /19 Okt 2026 • 14:30/);

  assert.equal(formatScanDate('invalid-date'), 'Baru saja');
});

test('createHistoryItem generates valid item with timestamp and defaults', () => {
  const item = createHistoryItem(
    'Serat Centhini',
    'ꦱꦶꦤꦸꦮꦸꦤ꧀',
    'Sinar kemuliaan',
    { language: 'Aksara Jawa' }
  );
  assert.equal(item.title, 'Serat Centhini');
  assert.equal(item.aksaraText, 'ꦱꦶꦤꦸꦮꦸꦤ꧀');
  assert.equal(item.translation, 'Sinar kemuliaan');
  assert.equal(item.language, 'Aksara Jawa');
  assert.ok(item.id.startsWith('scan-'));
  assert.ok(typeof item.timestamp === 'number');
});

test('filterHistory searches across title, translation, and language', () => {
  const filtered1 = filterHistory(INITIAL_MOCK_HISTORY, 'sutasoma');
  assert.equal(filtered1.length, 1);
  assert.equal(filtered1[0].title, 'Kakawin Sutasoma - Pupuh 139');

  const filtered2 = filterHistory(INITIAL_MOCK_HISTORY, 'Jawa Kuno');
  assert.equal(filtered2.length, 2);

  const filteredEmpty = filterHistory(INITIAL_MOCK_HISTORY, '');
  assert.equal(filteredEmpty.length, 3);
});

test('prepareSpeechPayload configures Indonesian speech synthesis parameters', () => {
  const payload = prepareSpeechPayload('  Sinar matahari menyinari bumi.  \n Memberi kehidupan. ');
  assert.equal(payload.lang, 'id-ID');
  assert.equal(payload.rate, 0.95);
  assert.equal(payload.text, 'Sinar matahari menyinari bumi. Memberi kehidupan.');

  // Verify sanitization of Brahmic unicode and quotation marks
  const payloadAksara = prepareSpeechPayload('ꦱꦶꦤꦸꦮꦸꦤ꧀ "Sinuhun surya bumi"');
  assert.equal(payloadAksara.text, 'Sinuhun surya bumi');
});

test('validateScanInput validates required fields', () => {
  const invalid = validateScanInput({});
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.length, 2);

  const valid = validateScanInput({
    aksaraText: 'ꦱꦶꦤꦸꦮꦸꦤ꧀',
    translation: 'Sinar matahari',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('cleanManuscriptText strips dummy baris numbers, prefixes, and metadata comments', () => {
  const dummyInput = `baris 1 (tampak tertera pada naskah daun lontar/daluang)
baris 2
baris 3
baris 4
baris 5
baris 6`;
  assert.equal(cleanManuscriptText(dummyInput), '');

  const translitWithPrefixes = `Baris 1: tatastu binnas
Baris 2: ...
Baris 3: mangrwa tan hana
Baris 4: ...`;
  const cleaned = cleanManuscriptText(translitWithPrefixes);
  assert.equal(cleaned, 'tatastu binnas\nmangrwa tan hana');

  const cleanVerses = `Swastyastu namaḥ śiwāya
tatastu astu mangayubagya`;
  assert.equal(cleanManuscriptText(cleanVerses), cleanVerses);

  // Test deduplication of consecutive identical lines
  const dupInput = `tatastu astu
tatastu astu
tatastu astu`;
  assert.equal(cleanManuscriptText(dupInput), 'tatastu astu');

  // Test Batavia hallucination rehabilitation
  const bataviaHallucination = `tatarikantirikantarikan
tatarikantirikantarikan`;
  assert.match(cleanManuscriptText(bataviaHallucination), /swastyastu namaḥ śiwatita/);
});

test('detectScriptFromUnicode accurately recognizes scripts across all traditions', () => {
  assert.equal(detectScriptFromUnicode('ꦱꦶꦤꦸꦮꦸꦤ꧀ ꦱꦸꦂꦪ'), 'javanese');
  assert.equal(detectScriptFromUnicode('ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ'), 'balinese');
  assert.equal(detectScriptFromUnicode('ᮔᮤᮠᮔ᮪ ᮒᮕᮊ᮪ ᮞᮥᮔ᮪ᮓ'), 'sundanese');
  assert.equal(detectScriptFromUnicode('ᯅᯉᯪ ᯀᯂᯮ ᯔᯉᯮᯄ᯦᯲'), 'batak');
  assert.equal(detectScriptFromUnicode('ᨕᨗᨐᨊ ᨔᨙᨓ ᨒᨚᨈᨚ'), 'lontara');
  assert.equal(detectScriptFromUnicode('بِسْمِ اللَّهِ نِيَاتْ'), 'pegon');
  assert.equal(detectScriptFromUnicode('𑀲𑀼𑀩𑀲𑁆𑀢𑀼 𑀦𑀫𑀄'), 'kawi');
  assert.equal(detectScriptFromUnicode('Plain latin text'), null);
});

test('resolveLanguageAttribution prevents cross-language confusion and auto-corrects mismatches', () => {
  // If Sunda text was mistakenly tagged as Aksara Jawa by AI, it must be auto-corrected
  const mismatchedSunda = {
    title: 'Prasasti Kawali',
    ancientText: 'ᮔᮤᮠᮔ᮪ ᮒᮕᮊ᮪ ᮞᮥᮔ᮪ᮓ',
    language: 'Aksara Jawa Kuno',
    language_short: 'Aksara Jawa',
  };
  const resolvedSunda = resolveLanguageAttribution(mismatchedSunda);
  assert.match(resolvedSunda.language, /Aksara Sunda/);
  assert.equal(resolvedSunda.language_short, 'Aksara Sunda');
  assert.equal(resolvedSunda.script_type, 'Aksara Sunda');

  // If Balinese lontar was tagged as Jawa, auto-correct to Bali
  const mismatchedBali = {
    title: 'Arjuna Wiwaha',
    ancientText: 'ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ',
    language: 'Aksara Jawa',
  };
  const resolvedBali = resolveLanguageAttribution(mismatchedBali);
  assert.match(resolvedBali.language, /Aksara Bali/);
  assert.equal(resolvedBali.language_short, 'Aksara Bali');

  // If Batak pustaha was passed, guarantee Surat Batak
  const batakData = {
    title: 'Pustaha Laklak',
    ancientText: 'ᯅᯉᯪ ᯀᯂᯮ',
    language: 'Batak',
  };
  const resolvedBatak = resolveLanguageAttribution(batakData);
  assert.match(resolvedBatak.language, /Surat Batak/);
  assert.equal(resolvedBatak.language_short, 'Surat Batak');

  // If Lontara Bugis was passed, guarantee Aksara Lontara
  const lontaraData = {
    title: 'Sureq Galigo',
    ancientText: 'ᨕᨗᨐᨊ ᨔᨙᨓ',
    language: 'Bugis',
  };
  const resolvedLontara = resolveLanguageAttribution(lontaraData);
  assert.match(resolvedLontara.language, /Aksara Lontara/);
  assert.equal(resolvedLontara.language_short, 'Aksara Lontara');
});
