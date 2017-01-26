import template from './quotas-table.html';
import './quotas-table.scss';

const quotasTable = {
  template,
  bindings: {
    resource: '<'
  }
};

export default quotasTable;
