import template from './types-list-dialog.html';
import './types-list-dialog.scss';

const typesListDialog = {
  template,
  bindings: {
    dismiss: '&',
    types: '<',
    dialogTitle: '<',
  },
};

export default typesListDialog;
