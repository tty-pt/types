export class MetaHandler {
  constructor(type, dependencies = {}) {
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
}
