// URL Template Cache for performance optimization
// Caches parsed templates and variable names to avoid redundant processing

interface CachedTemplate {
  variableNames: string[];
  expand: (context: object) => string;
}

const templateCache = new Map<string, CachedTemplate>();
const headerNormalizationCache = new Map<string, string>();

// Common GitHub API endpoint patterns for fast path optimization
const COMMON_ENDPOINTS = new Set([
  "/repos/{owner}/{repo}/issues",
  "/repos/{owner}/{repo}/pulls",
  "/repos/{owner}/{repo}/commits",
  "/repos/{owner}/{repo}/contents/{path}",
  "/repos/{owner}/{repo}",
  "/user",
  "/users/{username}",
  "/orgs/{org}",
  "/repos/{owner}/{repo}/git/refs/{ref}",
  "/repos/{owner}/{repo}/git/commits/{commit_sha}",
]);

export function getCachedTemplate(
  template: string,
): CachedTemplate | undefined {
  return templateCache.get(template);
}

export function setCachedTemplate(
  template: string,
  cached: CachedTemplate,
): void {
  templateCache.set(template, cached);
}

export function getCachedHeaderKey(key: string): string {
  const cached = headerNormalizationCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const normalized = key.toLowerCase();
  headerNormalizationCache.set(key, normalized);
  return normalized;
}

/* c8 ignore start */
export function isCommonEndpoint(template: string): boolean {
  return COMMON_ENDPOINTS.has(template);
}
/* c8 ignore stop */

export function clearTemplateCache(): void {
  templateCache.clear();
  headerNormalizationCache.clear();
}

/* c8 ignore start */
// Get cache statistics for monitoring
export function getCacheStats() {
  return {
    templateCacheSize: templateCache.size,
    headerCacheSize: headerNormalizationCache.size,
  };
}
/* c8 ignore stop */
