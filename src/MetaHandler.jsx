import { Sub } from "@mov-ai/mov-fe-lib-sub";

export
const metaSub = new Sub({});

export class MetaHandler {
  constructor(type, fetcher, indexer, options = {}) {
    this.type = type;
    this.title = options.title ?? type.title;
    this.adapter = options.adapter ?? (a => a);
    this.sep = "@";
    this.global = options.global ?? false;
    this.fetcher = fetcher;
    this.fetcherSubscribe = options.fetcherSubscribe ?? "subscribe";
    this.fetcherUnsubscribe = options.fetcherUnsubscribe ?? "unsubsribe";
    this.indexKey = options.indexKey ?? "index";
    this.indexer = indexer;
    this.toIndex = !options.noIndex;
    this.cache = this.toIndex ? [] : this.transform(this.type.preprocess({}, this.type.meta, this.sep));
    this.last = null;

    if (this.indexer)
      this.indexerSub = this.indexer.subscribe(this.setIndex.bind(this));
    else
      this.dontSetIndex();

    const boundSetData = this.setData.bind(this);
    this.fetcher.getAll(boundSetData);
    this.fetcherSub = this.fetcher[this.fetcherSubscribe](boundSetData);

    metaSub.set(this.title, this.cache);
    this.use = (path) => metaSub.use(this.title + (path ? "." + path : ""))
  }

  destroy() {
    metaSub.set(this.title, null);
    this.fetcher[this.fetcherUnsubscribe](this.fetcherSub);
    this.fetcherSub = null;
    this.indexer.unsubscribe(this.indexerSub);
    this.cache = null;
    this.last = null;
    this.fetcher = null;

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
      return this.adapter(this.type.preprocess(data, {}, this.sep));

    if (!this.index)
      return [];

    return Object.entries(this.index ?? {}).map(([key, index]) => this.adapter(this.type.preprocess({
      ...data,
      [this.indexKey]: index,
    }, {}, key + this.sep)));
  }

  setData(data) {
    const newState = this.transform(data);
    if (this.last)
      this.onChange(newState);
    this.cache = newState;
    this.last = data;
    metaSub.set(this.title, this.cache);
  }

  setIndex(index) {
    if (Object.keys(index).length) {
      this.index = index;
      this.cache = this.transform(this.last);
    } else
      this.cache = this.index = null;
    metaSub.set(this.title, this.cache);
  }

  dontSetIndex() {
    this.index = null;
    this.cache = this.transform(this.last);
    metaSub.set(this.title, this.cache);
  }
}
