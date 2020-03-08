import { translate } from '@waldur/i18n';
import { createNameField } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { Offering } from '../types';

import { validatePermissions, validateOfferingState } from './utils';

const formatReport = resource =>
  resource.report ? JSON.stringify(resource.report) : '';

export default function createAction(): ResourceAction<Offering> {
  return {
    name: 'update',
    title: translate('Update'),
    type: 'form',
    method: 'PUT',
    successMessage: translate('Request to update has been accepted.'),
    fields: [
      createNameField<Offering>(),
      {
        name: 'report',
        label: translate('Report'),
        help_text: translate(
          'Example: [{"header": "Database instance info", "body": "data"}]',
        ),
        serializer: (value: any) => (value ? JSON.parse(value) : undefined),
        init: (_, resource, form) => {
          form.report = formatReport(resource);
        },
        default_value: undefined,
        required: false,
        type: 'json',
      },
    ],
    validators: [validateOfferingState('OK', 'Erred'), validatePermissions],
  };
}
