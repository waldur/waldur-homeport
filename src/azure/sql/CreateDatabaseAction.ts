import { cacheInvalidationFactory } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { validateState, createNameField, createDescriptionField } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'create_database',
    title: translate('Create'),
    dialogTitle: translate('Create SQL database in PostgreSQL server'),
    tab: 'databases',
    iconClass: 'fa fa-plus',
    type: 'form',
    method: 'POST',
    validators: [validateState('OK')],
    fields: [
      createNameField(),
      createDescriptionField(),
    ],
    onSuccess: cacheInvalidationFactory('azureSQLDatabasesService'),
  };
}
