export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const basePrefixWithoutSlash = cleanBase.startsWith('/') ? cleanBase.slice(1) : cleanBase;

  if (basePrefixWithoutSlash && basePrefixWithoutSlash !== '/') {
    while (cleanPath.startsWith(basePrefixWithoutSlash)) {
      cleanPath = cleanPath.slice(basePrefixWithoutSlash.length);
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.slice(1);
      }
    }
  }

  return `${cleanBase}${cleanPath}`;
}
