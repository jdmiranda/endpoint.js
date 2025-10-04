import { getCachedHeaderKey } from "./url-template-cache.js";

export function lowercaseKeys(object?: { [key: string]: any }) {
  if (!object) {
    return {};
  }

  return Object.keys(object).reduce((newObj: { [key: string]: any }, key) => {
    newObj[getCachedHeaderKey(key)] = object[key];
    return newObj;
  }, {});
}
