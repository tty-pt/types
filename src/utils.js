function _get(obj, key, defaultValue) {
  if (!key)
    return obj ?? defaultValue;
  const [headKey, ...tailKeys] = key.split(".");
  return _get(obj[headKey], tailKeys.join("."));
}

export function enumCount(declaration, arr, key) { // robotState, robot.robotState
  let ans = {};

  for (const key of Object.values(declaration))
    ans[key] = 0;

  for (const item of arr)
    ans[_get(item, key)]++;

  return ans;
}
