// @ngInject
export default function azureSQLDatabasesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/azure-sql-databases/';
    }
  });
  return new ServiceClass();
}
