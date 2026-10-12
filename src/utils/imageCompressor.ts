/**
 * Image compressor & uploader utility
 * Resizes images client-side to prevent localStorage QuotaExceededError
 * and uploads to server /api/upload endpoint for lightweight URLs.
 */

export async function compressAndUploadImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85
): Promise<string> {
  // 1. First compress using client-side HTML5 Canvas
  const compressedBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into DOM'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Fill background white in case of transparent png converted to jpeg
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {}

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

  // 2. Try to upload to server endpoint /api/upload
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: compressedBase64,
        filename: file.name
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Server upload failed, falling back to compressed base64 data:', err);
  }

  // 3. Fallback to lightweight compressed base64 (<100KB)
  return compressedBase64;
}
