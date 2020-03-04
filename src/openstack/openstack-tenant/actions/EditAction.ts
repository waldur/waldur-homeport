import { translate } from '@waldur/i18n';
import {
  createDefaultEditAction,
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { mergeActions } from '@waldur/resource/actions/utils';

import { userCanModifyTenant } from './utils';

export default function createAction(): ResourceAction {
  return mergeActions(createDefaultEditAction(), {
    successMessage: translate('Tenant has been updated.'),
    fields: [createLatinNameField(), createDescriptionField()],
    validators: [userCanModifyTenant],
  });
}
