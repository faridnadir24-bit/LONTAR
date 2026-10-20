/**
 * Image Preprocessing & Compression Service for LONTAR.ai
 * Downsamples high-resolution mobile camera captures and gallery uploads
 * to ensure fast uploads, compliance with serverless payload limits,
 * and rapid Gemini Vision inference times while maintaining script sharpness.
 */

const DEFAULT_MAX_DIMENSION = 960;
const DEFAULT_QUALITY = 0.76;

/**
 * Optimizes an image File (e.g. from file input) by scaling it down to a maximum
 * dimension while preserving aspect ratio, then converting to compressed JPEG.
 *
 * @param {File|Blob} file 
 * @param {number} [maxDimension=1400]
 * @param {number} [quality=0.82]
 * @returns {Promise<{ dataUrl: string, base64: string, mimeType: string }>}
 */
export async function optimizeImageFile(file, maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY) {
  if (!file) throw new Error('Berkas gambar tidak ditemukan');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar dari perangkat.'));
    reader.onload = (e) => {
      const srcUrl = e.target.result;
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas gambar tidak dapat diproses.'));
      img.onload = () => {
        try {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;

          if (w > maxDimension || h > maxDimension) {
            if (w > h) {
              h = Math.round((h * maxDimension) / w);
              w = maxDimension;
            } else {
              w = Math.round((w * maxDimension) / h);
              h = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
            const mimeType = 'image/jpeg';
            const dataUrl = canvas.toDataURL(mimeType, quality);
            const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
            resolve({ dataUrl, base64, mimeType });
          } else {
            const match = srcUrl.match(/^data:(.*?);base64,(.*)$/);
            resolve({
              dataUrl: srcUrl,
              base64: match ? match[2] : srcUrl,
              mimeType: match ? match[1] : 'image/jpeg',
            });
          }
        } catch (scaleErr) {
          reject(scaleErr);
        }
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes an existing base64 / dataUrl string to ensure it fits safely
 * within serverless transport limits.
 *
 * @param {string} dataUrl
 * @param {number} [maxDimension=1400]
 * @param {number} [quality=0.82]
 * @returns {Promise<{ dataUrl: string, base64: string, mimeType: string }>}
 */
export async function optimizeBase64(dataUrl, maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY) {
  if (!dataUrl) throw new Error('Data URL tidak ditemukan');

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => {
      const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
      resolve({
        dataUrl,
        base64: match ? match[2] : dataUrl,
        mimeType: match ? match[1] : 'image/jpeg',
      });
    };
    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        if (w <= maxDimension && h <= maxDimension) {
          const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
          resolve({
            dataUrl,
            base64: match ? match[2] : dataUrl,
            mimeType: match ? match[1] : 'image/jpeg',
          });
          return;
        }

        if (w > h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          const mimeType = 'image/jpeg';
          const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
          const base64 = optimizedDataUrl.replace(/^data:image\/jpeg;base64,/, '');
          resolve({ dataUrl: optimizedDataUrl, base64, mimeType });
        } else {
          const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
          resolve({
            dataUrl,
            base64: match ? match[2] : dataUrl,
            mimeType: match ? match[1] : 'image/jpeg',
          });
        }
      } catch (_) {
        const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
        resolve({
          dataUrl,
          base64: match ? match[2] : dataUrl,
          mimeType: match ? match[1] : 'image/jpeg',
        });
      }
    };
    img.src = dataUrl;
  });
}
