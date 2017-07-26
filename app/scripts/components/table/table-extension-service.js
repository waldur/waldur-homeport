export default class TableExtensionService {
  constructor() {
    this._tables = {};
  }

  registerColumns(table, columns) {
    this._tables[table] = columns;
  }

  getColumns(table) {
    return this._tables[table] || [];
  }
}
