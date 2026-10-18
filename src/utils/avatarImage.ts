// ─── avatarImage ──────────────────────────────────────────────────────────────
// Turns a photo the person picked into a small square profile picture before it
// leaves their device. Redrawing it on a canvas re-encodes the pixels only, so
// hidden metadata (such as the GPS location phones add) and anything else
// embedded in the original file is dropped.

export const AVATAR_INPUT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const SIZE = 320;

/** Why a picked file cannot be used, or null when it can. */
export function avatarFileProblem(file: File): string | null {
  if (!AVATAR_INPUT_TYPES.includes(file.type)) return 'Choose a JPEG, PNG or WebP photo.';
  if (file.size > MAX_INPUT_BYTES) return 'That photo is larger than 10 MB. Choose a smaller one.';
  return null;
}

/** A centred square crop of the photo, re-encoded as WebP (or JPEG where WebP is unavailable). */
export async function prepareAvatar(file: File): Promise<Blob> {
  const problem = avatarFileProblem(file);
  if (problem) throw new Error(problem);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('That file could not be read as a photo.');
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process the photo.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();

  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  // Browsers without WebP encoding hand back a PNG instead, so check the type
  let blob = await encode('image/webp');
  if (blob?.type !== 'image/webp') blob = await encode('image/jpeg');
  if (blob?.type !== 'image/jpeg' && blob?.type !== 'image/webp') throw new Error('Your browser could not process the photo.');
  return blob;
}
