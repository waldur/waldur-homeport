export default class TableExtensionService {
  constructor() {
    this._tables = {};
    this.TABLE_ACTIONS = 'table_actions';
    this.COLUMNS = 'columns';
  }

  registerColumns(table, columns) {
    this.registerItems(table, this.COLUMNS, columns);
  }

  registerTableActions(table, actions) {
    this.registerItems(table, this.TABLE_ACTIONS, actions);
  }

  getTableActions(table) {
    return this.getItems(table, this.TABLE_ACTIONS);
  }

  getColumns(table) {
    return this.getItems(table, this.COLUMNS);
  }

  registerItems(table, key, items) {
    this._tables[table] = this._tables[table] || {};
    this._tables[table][key] = this._tables[table][key] || [];
    this._tables[table][key] = this._tables[table][key].concat(items);
  }

  getItems(table, key) {
    let result = [];
    if (this._tables[table]) {
      result = this._tables[table][key] || [];
    }

    // always immutable
    return angular.copy(result);
  }
}
