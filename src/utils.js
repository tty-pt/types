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
