import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatScanDate,
  createHistoryItem,
  filterHistory,
  prepareSpeechPayload,
  validateScanInput,
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
