export class MetaHandler {
  constructor(type, indexable, dependencies = {}) {
    this.type = type;
    this.adapter = dependencies?.adapter ?? (a => a);
    this.dependencies = dependencies;
    this.subscriptions = new Map();
    this.sep = "@";
    this.indexable = indexable;
    this.cache = this.indexable ? [] : this.type.preprocess({}, this.type.meta, this.sep);
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

    else if (this.index)
      Object.keys(value).forEach(index => {
        if (this.type.diff(value[index], this.cache[index]))
          this.type.onChange(value[index], this.cache[index]);
      });
    else if (this.type.diff(value, this.cache))
      this.type.onChange(value, this.cache);
  }

  transform(data) {
    if (!this.indexable)
      return this.type.preprocess(data, this.type.meta, this.sep);

    if (!this.index)
      return [];

    return Object.entries(this.index ?? {}).map(([key, robot]) => this.adapter(this.type.preprocess({
      ...data, // TODO only this robots info?
      robot,
    }, this.type.meta, key + this.sep)));
  }
}
