import { getCachedTemplate, setCachedTemplate } from "./url-template-cache.js";

const urlVariableRegex = /\{[^{}}]+\}/g;

function removeNonChars(variableName: string) {
  return variableName.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g, "").split(/,/);
}

export function extractUrlVariableNames(url: string) {
  // Check cache first
  const cached = getCachedTemplate(url);
  if (cached && cached.variableNames.length > 0) {
    return cached.variableNames;
  }

  const matches = url.match(urlVariableRegex);

  if (!matches) {
    return [];
  }

  const variableNames = matches
    .map(removeNonChars)
    .reduce((a, b) => a.concat(b), []);

  // Cache the result
  const existingCache = getCachedTemplate(url);
  if (existingCache) {
    setCachedTemplate(url, {
      ...existingCache,
      variableNames,
    });
  } else {
    setCachedTemplate(url, {
      variableNames,
      expand: () => url,
    });
  }

  return variableNames;
}
