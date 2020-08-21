import { translate } from '@waldur/i18n';
import { updateTenant } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
  createEditAction,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { userCanModifyTenant } from './utils';

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: [createLatinNameField(), createDescriptionField()],
    validators: [userCanModifyTenant],
    updateResource: updateTenant,
    verboseName: translate('OpenStack tenant'),
  });
}
