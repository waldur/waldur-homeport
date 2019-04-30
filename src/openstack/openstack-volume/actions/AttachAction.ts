import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { validateRuntimeState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

export default function createAction(ctx: ActionContext<Volume>): ResourceAction {
  return {
    name: 'attach',
    type: 'form',
    method: 'POST',
    title: translate('Attach'),
    validators: [
      validateRuntimeState('available'),
    ],
    fields: [
      {
        name: 'instance',
        label: translate('Instance'),
        type: 'select',
        required: true,
        url: `${ENV.apiEndpoint}api/openstacktenant-instances/?service_uuid=${ctx.resource.service_uuid}`,
        value_field: 'url',
        display_name_field: 'name',
      },
      {
        name: 'device',
        label: translate('Device'),
        type: 'string',
        help_text: translate('Name of volume as instance device e.g. /dev/vdb.'),
        required: false,
      },
    ],
  };
}
