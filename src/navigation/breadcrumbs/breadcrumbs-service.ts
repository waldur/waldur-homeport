export default class BreadcrumbsService {
  constructor() {
    this._handlers = [];
    this._items = [];
    this._activeItem = '';
  }

  listen(handler) {
    this._handlers.push(handler);
    return () => {
      this._handlers.splice(this._handlers.indexOf(handler), 1);
    };
  }

  _notify() {
    this._handlers.forEach(handler => handler());
  }

  get items() {
    return this._items;
  }

  set items(items) {
    this._items = items;
    this._notify();
  }

  get activeItem() {
    return this._activeItem;
  }

  set activeItem(item) {
    this._activeItem = item;
    this._notify();
  }
}
