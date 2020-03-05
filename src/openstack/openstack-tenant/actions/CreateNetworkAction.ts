import { translate } from '@waldur/i18n';
import {
  validateState,
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'create_network',
    type: 'form',
    method: 'POST',
    tab: 'networks',
    title: translate('Create'),
    dialogTitle: translate('Create network for OpenStack tenant'),
    iconClass: 'fa fa-plus',
    fields: [createLatinNameField(), createDescriptionField()],
    validators: [validateState('OK')],
  };
}
