import { translate } from '@waldur/i18n';
import { updateOffering } from '@waldur/offering/api';
import {
  createNameField,
  createEditAction,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { Offering } from '../types';

import { validatePermissions, validateOfferingState } from './utils';

export default function createAction({ resource }): ResourceAction<Offering> {
  return createEditAction({
    resource,
    updateResource: (id, formData) =>
      updateOffering(id, {
        name: formData.name,
        report: formData.report ? JSON.parse(formData.report) : undefined,
      }),
    verboseName: translate('offering'),
    getInitialValues: () => ({
      name: resource.name,
      report: resource.report ? JSON.stringify(resource.report) : '',
    }),
    fields: [
      createNameField<Offering>(),
      {
        name: 'report',
        label: translate('Report'),
        help_text: translate(
          'Example: [{"header": "Database instance info", "body": "data"}]',
        ),
        required: false,
        type: 'json',
      },
    ],
    validators: [validateOfferingState('OK', 'Erred'), validatePermissions],
  });
}
