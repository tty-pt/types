export class MetaHandler {
  constructor(type, dependencies = {}) {
    this.sep = "@";
    this.type = type;
    this.adapter = dependencies?.adapter ?? (a => a);
    this.dependencies = dependencies;
    this.subscriptions = new Map();
  }

  construct() {
    this.cache = this.type.initial(this.type.meta);
    this.last = null;
  }

  updateSubs() {
    for (let [ sub ] of this.subscriptions)
      sub(this.cache);
  }

  destroy() {
    this.updateSubs(null);
    delete this.subscriptions;
    this.cache = null;
    this.last = null;
  }

  subscribe(onUpdate) {
    this.subscriptions.set(onUpdate, true);
    return () => {
      this.subscriptions.delete(onUpdate);
    };
  }

  // setState() {}

  onChange(value) {
    if (!this.dependencies.global)
      return;

    this.type.onChange(value);
  }

  transformOnce(data) {
    return this.adapter(Object.keys(this.type.types).reduce((b, key) => ({
      ...b,
      [key]: (data[key] !== undefined
        ? this.type.types[key].preprocess(data[key], this.type.meta)
        : this.type.types[key].initial(this.type.meta)
      ), 
    }), {}))
  }

  transformField(value, name /*, index */) {
    return value[name];
    // return varTransform(value, {
    //   ...this.type.meta,
    //   ...this.type.types[name].meta,
    //   name,
    //   index,
    // });
  }

  transformData(map, data, key) {
    const [index, namePre] = key.split(this.sep);
    const name = this.type.meta.transformKey.out(namePre);
    const subType = this.type.types[name];
    if (!subType) return;
    map[name] = this.transformField(data, name, index);
  }

  indexedTransformData(map, data, key) {
    const [index, namePre] = key.split(this.sep);
    const name = this.type.meta.transformKey.out(namePre);
    const subType = this.type.types[name];
    if (!subType) return;
    let indexed = map[index] || {};
    indexed[name] = this.transformField(data, name, index);
    map[index] = indexed;
  }

  _getMap(data) {
    if (!data) return {};

    let map = {};

    Object.keys(data).forEach(this.index
      ? key => this.indexedTransformData(map, data, key)
      : key => this.transformData(map, data, key)
    );

    return map;
  }

  getMap(data) {
    let map = this._getMap(data);

    if (this.index) {
      // create variable data if it doesn't exist
      for (let key in this.index) {
        if (!map[key]) map[key] = {};
        const indexed = this.index[key];
        const targetIndexed = map[key];

        for (let ikey in this.type.types) {
          if (targetIndexed[ikey] !== undefined)
            continue;

          const subType = this.type.types[ikey];

          targetIndexed[ikey] = indexed[ikey] === undefined
            ? subType.initial(this.type.meta)
            : subType.preprocess(indexed[ikey], this.type.meta);
        }

        map[key] = targetIndexed;
      }
    }
    else
      for (let ikey in this.type.types)
        map[ikey] = map[ikey] ?? this.type.types[ikey].initial(this.type.meta);

    return map;
  }

  transform(data = null) {
    const map = this.getMap(data);

    if (this.index)
      return Object.values(map).map(value => this.transformOnce(value));

    return this.transformOnce(map);
  }
}
