export function _get(object, path, defaultValue) {
  if (typeof object === "undefined" || object === null)
    return defaultValue;

  if (path === "")
    return object;

  const keys = path.split(".");

  for (let i = 0; i < keys.length; i++) {
    object = object[keys[i]];
    if (!object)
      return defaultValue;
  }

  return object;
}
