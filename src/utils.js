export function enumCount(declaration, arr, key) {
  const initial = Object.values(declaration).reduce((a, value) => ({
    ...a,
    [value]: 0,
  }), {});

  return arr.reduce((a, item) => ({
    ...a,
    [item[key]]: a[item[key]] + 1,
  }), initial);
}
