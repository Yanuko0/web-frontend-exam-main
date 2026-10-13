// Next.js returns an object ({ src, width, height }) for statically imported
// images; other tooling returns the URL string. Normalize to the URL.
export default function assetUrl(asset) {
  return typeof asset === 'string' ? asset : asset.src;
}
