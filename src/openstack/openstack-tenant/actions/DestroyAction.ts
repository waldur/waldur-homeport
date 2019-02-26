import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { ResourceAction } from '@waldur/resource/actions/types';

import { userCanModifyTenant } from './utils';
// tslint:disable-next-line:no-var-requires
const DestroyActionSubtitle = require('./DestroyActionSubtitle.md');

export default function createAction(): ResourceAction {
  return {
    name: 'destroy',
    type: 'form',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [userCanModifyTenant],
    dialogSubtitle: DestroyActionSubtitle,
    isVisible: !marketplaceIsVisible(),
  };
}
