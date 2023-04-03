export class MetaHandler {
  constructor(type, fetcher, indexer, options = {}) {
    this.type = type;
    this.adapter = options.adapter ?? (a => a);
    this.subscriptions = new Map();
    this.sep = "@";
    this.global = options.global ?? false;
    this.fetcher = fetcher;
    this.fetcherSubscribe = options.fetcherSubscribe ?? "subscribe";
    this.fetcherUnsubscribe = options.fetcherUnsubscribe ?? "unsubsribe";
    this.indexKey = options.indexKey ?? "index";
    this.indexer = indexer;
    this.toIndex = !options.noIndex;
    this.cache = this.toIndex ? [] : this.type.preprocess({}, this.type.meta, this.sep);
    this.last = null;

    if (this.indexer)
      this.indexerSub = this.indexer.subscribe(this.setIndex.bind(this));
    else
      this.dontSetIndex();

    const boundSetData = this.setData.bind(this);
    this.fetcher.getAll(boundSetData);
    this.fetcherSub = this.fetcher[this.fetcherSubscribe](boundSetData);
  }

  updateSubs() {
    for (let [ sub ] of this.subscriptions)
      sub(this.cache);
  }

  destroy() {
    this.updateSubs(null);
    this.fetcher[this.fetcherUnsubscribe](this.fetcherSub);
    this.fetcherSub = null;
    this.indexer.unsubscribe(this.indexerSub);
    delete this.subscriptions;
    this.cache = null;
    this.last = null;
    this.fetcher = null;

  }

  subscribe(onUpdate) {
    this.subscriptions.set(onUpdate, true);
    return () => {
      this.subscriptions.delete(onUpdate);
    };
  }

  // setState() {}

  onChange(value) {
    if (!this.global)
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
    if (!this.toIndex)
      return this.type.preprocess(data, this.type.meta, this.sep);

    if (!this.index)
      return [];

    return Object.entries(this.index ?? {}).map(([key, index]) => this.adapter(this.type.preprocess({
      ...data,
      [this.indexKey]: index,
    }, this.type.meta, key + this.sep)));
  }

  setData(data) {
    const newState = this.transform(data);
    if (this.last)
      this.onChange(newState);
    this.cache = newState;
    this.last = data;
    this.updateSubs();
  }

  setIndex(index) {
    if (Object.keys(index).length) {
      this.index = index;
      this.cache = this.transform(this.last);
    } else
      this.cache = this.index = null;
    this.updateSubs();
  }

  dontSetIndex() {
    this.index = null;
    this.cache = this.transform(this.last);
    this.updateSubs();
  }
}
