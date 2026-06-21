const API_ORIGIN = new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').origin;

export const PRODUCT_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#111827"/>
          <stop offset="55%" stop-color="#1f2937"/>
          <stop offset="100%" stop-color="#0f766e"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)"/>
      <rect x="170" y="260" width="460" height="520" rx="56" fill="none" stroke="#99f6e4" stroke-width="28" opacity="0.75"/>
      <path d="M290 330c0-88 52-150 110-150s110 62 110 150" fill="none" stroke="#f8fafc" stroke-width="26" stroke-linecap="round" opacity="0.9"/>
      <text x="400" y="865" fill="#f8fafc" font-family="Arial, sans-serif" font-size="48" font-weight="700" text-anchor="middle">Product Image</text>
    </svg>
  `);

export const resolveImageUrl = (url) => {
  if (!url) return PRODUCT_PLACEHOLDER;
  if (url.startsWith('data:') || /^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
};

export const getProductImage = (product) => {
  const firstImage = product?.images?.[0];
  const raw =
    (typeof firstImage === 'string' ? firstImage : firstImage?.url) ||
    product?.image?.url ||
    product?.image ||
    product?.thumbnail;

  return resolveImageUrl(raw);
};
