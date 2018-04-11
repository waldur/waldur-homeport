import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(_): ResourceAction {
  return {
    key: 'update_security_groups',
    title: translate('Update security groups'),
    type: 'form',
    method: 'POST',
    validators: [validateState('OK')],
    fields: [
      {
        key: 'security_groups',
        type: 'multiselect',
        required: true,
        label: translate('Security groups'),
        placeholder: translate('Select security groups...'),
        resource_default_value: true,
        serializer: items => items.map(item => ({url: item.value})),
        value_field: 'url',
        display_name_field: 'name',
      },
    ],
  };
}
