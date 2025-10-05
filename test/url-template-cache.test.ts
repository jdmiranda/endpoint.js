import { describe, it, expect } from "vitest";
import { endpoint } from "../src/index.js";
import {
  clearTemplateCache,
  getCacheStats,
  getCachedHeaderKey,
  isCommonEndpoint,
} from "../src/util/url-template-cache.js";
import {
  clearUrlTemplateCache,
  getUrlTemplateCacheStats,
} from "../src/util/url-template.js";

describe("URL Template Cache", () => {
  it("caches URL template parsing", () => {
    clearUrlTemplateCache();

    const stats1 = getUrlTemplateCacheStats();
    expect(stats1.templateCacheSize).toBe(0);

    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
    });

    const stats2 = getUrlTemplateCacheStats();
    expect(stats2.templateCacheSize).toBeGreaterThan(0);

    // Calling again should use cache
    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
    });

    const stats3 = getUrlTemplateCacheStats();
    expect(stats3.templateCacheSize).toBe(stats2.templateCacheSize);
  });

  it("clears URL template cache", () => {
    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
    });

    clearUrlTemplateCache();

    const stats = getUrlTemplateCacheStats();
    expect(stats.templateCacheSize).toBe(0);
  });

  it("caches variable names extraction", () => {
    clearTemplateCache();

    const stats1 = getCacheStats();
    expect(stats1.templateCacheSize).toBe(0);

    endpoint("GET /repos/{owner}/{repo}", {
      owner: "octokit",
      repo: "endpoint.js",
    });

    const stats2 = getCacheStats();
    expect(stats2.templateCacheSize).toBeGreaterThan(0);
  });

  it("caches header key normalization", () => {
    clearTemplateCache();

    const stats1 = getCacheStats();
    expect(stats1.headerCacheSize).toBe(0);

    endpoint("GET /user", {
      headers: {
        Accept: "application/json",
        Authorization: "token xxx",
      },
    });

    const stats2 = getCacheStats();
    expect(stats2.headerCacheSize).toBeGreaterThan(0);

    // Verify getCachedHeaderKey works
    expect(getCachedHeaderKey("Accept")).toBe("accept");
    expect(getCachedHeaderKey("Authorization")).toBe("authorization");
  });

  it("identifies common endpoints", () => {
    expect(isCommonEndpoint("/repos/{owner}/{repo}/issues")).toBe(true);
    expect(isCommonEndpoint("/repos/{owner}/{repo}/pulls")).toBe(true);
    expect(isCommonEndpoint("/user")).toBe(true);
    expect(isCommonEndpoint("/some/random/path")).toBe(false);
  });

  it("clears all caches", () => {
    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
      headers: {
        Accept: "application/json",
      },
    });

    clearTemplateCache();
    clearUrlTemplateCache();

    const varNameStats = getCacheStats();
    const urlTemplateStats = getUrlTemplateCacheStats();

    expect(varNameStats.templateCacheSize).toBe(0);
    expect(varNameStats.headerCacheSize).toBe(0);
    expect(urlTemplateStats.templateCacheSize).toBe(0);
  });
});
