// function nugget(obj, keyArr) {
//   console.log("nugget", obj, keyArr);
//   const [headKey, ...tailKeys] = keyArr;
//   const item = obj[headKey];
//   if (!tailKeys.length)
//     return item;
//   return nugget(item, tailKeys);
// }

// function _get(obj, key, defaultValue) {
//   const item = obj[key];
//   if (!item)
//     return item ?? defaultValue;
//   const [headKey, ...tailKeys] = key.split(".");
//   return _get(obj[headKey], tailKeys.join("."));
// }

export
function mapCount(type, data, dataKey) {
  const key = typeof dataKey === "string" ? dataKey.split(".") : [dataKey];
  const subset = data.map(item => type.realRead(item, key));
  return subset.reduce((a, item) => {
    // const ritem = item === undefined ? null : (item === null ? undefined : item);
    return {
      ...a,
      [item]: (a[item] ?? 0) + 1,
      // [ritem]: (a[ritem] ?? 0) + 1,
      [null]: (a[null] ?? 0) + 1,
    };
  }, {});
}
