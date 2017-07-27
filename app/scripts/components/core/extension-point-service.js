export default class ExtensionPointService {
  constructor() {
    this._points = {};
  }

  register(pointId, template) {
    this._points[pointId] = template;
  }

  get(pointId) {
    return this._points[pointId];
  }
}
