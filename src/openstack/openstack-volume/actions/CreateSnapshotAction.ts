import { translate } from '@waldur/i18n';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'snapshot',
    type: 'form',
    tab: 'snapshots',
    method: 'POST',
    title: translate('Create'),
    dialogTitle: translate('Create snapshot for OpenStack volume'),
    iconClass: 'fa fa-plus',
    component: 'snapshotCreateDialog',
    useResolve: true,
    fields: [
      createLatinNameField(),
      createDescriptionField(),
      {
        name: 'kept_until',
        type: 'datetime',
        required: false,
        label: translate('Kept until'),
        help_text: translate(
          'Guaranteed time of snapshot retention. If null - keep forever.',
        ),
      },
    ],
  };
}
