import template from './quotas-table.html';

const quotasTable = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class quotasTableController {
    constructor(ncUtils) {
      this.ncUtils = ncUtils;
    }
  }
};

export default quotasTable;
