// ─── imageCredit ──────────────────────────────────────────────────────────────
// Photos from Wikimedia Commons must credit their author and licence. A link to
// the photo's Commons page (which names both) satisfies that, and the page can
// be worked out from the image address itself, so any Commons photo gets its
// credit without a separate field.

const FILE_PATH = /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^?#]+)/i;
const UPLOAD = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/i;

/** The Commons page for a Commons image address, or undefined for anything else. */
export function commonsPage(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  const file = imageUrl.match(FILE_PATH)?.[1] ?? imageUrl.match(UPLOAD)?.[1];
  return file ? `https://commons.wikimedia.org/wiki/File:${file}` : undefined;
}

/** Where to credit a photo: the recorded credit link if there is one, otherwise its Commons page. */
export function creditFor(imageUrl: string | null | undefined, recorded?: string | null): string | undefined {
  return recorded?.trim() || commonsPage(imageUrl);
}
