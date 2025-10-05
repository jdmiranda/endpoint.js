import { describe, bench } from "vitest";
import { endpoint } from "../src/index.js";
import { clearTemplateCache, getCacheStats } from "../src/util/url-template-cache.js";
import { clearUrlTemplateCache, getUrlTemplateCacheStats } from "../src/util/url-template.js";

describe("URL Construction Performance", () => {
  // Common GitHub API endpoints
  const commonEndpoints = [
    {
      name: "repos/issues - first call (cold cache)",
      options: {
        method: "GET",
        url: "/repos/{owner}/{repo}/issues",
        owner: "octokit",
        repo: "endpoint.js",
      },
    },
    {
      name: "repos/issues - cached call",
      options: {
        method: "GET",
        url: "/repos/{owner}/{repo}/issues",
        owner: "octokit",
        repo: "endpoint.js",
      },
    },
    {
      name: "repos/pulls",
      options: {
        method: "GET",
        url: "/repos/{owner}/{repo}/pulls",
        owner: "octokit",
        repo: "endpoint.js",
      },
    },
    {
      name: "repos/contents",
      options: {
        method: "GET",
        url: "/repos/{owner}/{repo}/contents/{path}",
        owner: "octokit",
        repo: "endpoint.js",
        path: "src/index.ts",
      },
    },
    {
      name: "repos/commits",
      options: {
        method: "GET",
        url: "/repos/{owner}/{repo}/commits",
        owner: "octokit",
        repo: "endpoint.js",
      },
    },
    {
      name: "user profile",
      options: {
        method: "GET",
        url: "/user",
      },
    },
    {
      name: "specific user",
      options: {
        method: "GET",
        url: "/users/{username}",
        username: "octokit",
      },
    },
    {
      name: "organization",
      options: {
        method: "GET",
        url: "/orgs/{org}",
        org: "github",
      },
    },
    {
      name: "git refs",
      options: {
        method: "GET",
        url: "/repos/{owner}/{repo}/git/refs/{ref}",
        owner: "octokit",
        repo: "endpoint.js",
        ref: "heads/main",
      },
    },
    {
      name: "complex query params",
      options: {
        method: "GET",
        url: "/repos/{owner}/{repo}/issues",
        owner: "octokit",
        repo: "endpoint.js",
        state: "open",
        labels: "bug,enhancement",
        sort: "created",
        direction: "desc",
        per_page: 100,
        page: 1,
      },
    },
  ];

  // Benchmark cold cache performance
  bench("cold cache - repos/issues", () => {
    clearTemplateCache();
    clearUrlTemplateCache();
    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
    });
  });

  // Benchmark hot cache performance
  bench("hot cache - repos/issues (10 calls)", () => {
    for (let i = 0; i < 10; i++) {
      endpoint("GET /repos/{owner}/{repo}/issues", {
        owner: "octokit",
        repo: "endpoint.js",
      });
    }
  });

  // Benchmark various endpoints
  for (const { name, options } of commonEndpoints) {
    bench(name, () => {
      endpoint(options);
    });
  }

  // Benchmark with headers
  bench("with custom headers", () => {
    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
      headers: {
        accept: "application/vnd.github.v3+json",
        "x-github-api-version": "2022-11-28",
        authorization: "token ghp_xxxxxxxxxxxxx",
      },
    });
  });

  // Benchmark with media type
  bench("with media type format", () => {
    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
      mediaType: {
        format: "raw",
      },
    });
  });

  // Benchmark POST with body
  bench("POST with body", () => {
    endpoint("POST /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
      title: "Bug report",
      body: "Something is broken",
      labels: ["bug"],
    });
  });

  // Benchmark mixed operations
  bench("mixed operations (100 calls)", () => {
    for (let i = 0; i < 100; i++) {
      const idx = i % commonEndpoints.length;
      endpoint(commonEndpoints[idx].options);
    }
  });

  // Log cache stats after benchmarks
  bench.skip("cache stats", () => {
    const varNameStats = getCacheStats();
    const urlTemplateStats = getUrlTemplateCacheStats();
    console.log("Variable Name Cache:", varNameStats);
    console.log("URL Template Cache:", urlTemplateStats);
  });
});

describe("URL Template Expansion", () => {
  bench("simple template - /repos/{owner}/{repo}", () => {
    endpoint("GET /repos/{owner}/{repo}", {
      owner: "octokit",
      repo: "endpoint.js",
    });
  });

  bench("template with path - /repos/{owner}/{repo}/contents/{path}", () => {
    endpoint("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: "octokit",
      repo: "endpoint.js",
      path: "src/index.ts",
    });
  });

  bench("template with multiple segments", () => {
    endpoint("GET /repos/{owner}/{repo}/git/commits/{commit_sha}", {
      owner: "octokit",
      repo: "endpoint.js",
      commit_sha: "abc123def456",
    });
  });

  bench("no template - /user", () => {
    endpoint("GET /user");
  });
});

describe("Parameter Processing", () => {
  bench("no parameters", () => {
    endpoint("GET /user");
  });

  bench("few parameters (2)", () => {
    endpoint("GET /repos/{owner}/{repo}", {
      owner: "octokit",
      repo: "endpoint.js",
    });
  });

  bench("many parameters (8)", () => {
    endpoint("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
      state: "open",
      labels: "bug",
      sort: "created",
      direction: "desc",
      per_page: 100,
      page: 1,
    });
  });

  bench("array parameters", () => {
    endpoint("POST /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "endpoint.js",
      title: "Bug",
      labels: ["bug", "critical", "priority-high"],
    });
  });
});

describe("Header Normalization", () => {
  bench("no headers", () => {
    endpoint("GET /user");
  });

  bench("few headers (2)", () => {
    endpoint("GET /user", {
      headers: {
        accept: "application/json",
        "user-agent": "test",
      },
    });
  });

  bench("many headers (6)", () => {
    endpoint("GET /user", {
      headers: {
        accept: "application/json",
        "user-agent": "test",
        authorization: "token xxx",
        "x-github-api-version": "2022-11-28",
        "if-none-match": "etag",
        "cache-control": "no-cache",
      },
    });
  });

  bench("repeated header keys (cache hit)", () => {
    for (let i = 0; i < 10; i++) {
      endpoint("GET /user", {
        headers: {
          Accept: "application/json",
          Authorization: "token xxx",
        },
      });
    }
  });
});
