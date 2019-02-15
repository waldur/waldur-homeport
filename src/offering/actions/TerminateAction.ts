import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { ResourceAction } from '@waldur/resource/actions/types';

import { Offering } from '../types';
import { validatePermissions, validateOfferingState } from './utils';

export default function createAction(): ResourceAction<Offering> {
  return {
    name: 'terminate',
    type: 'button',
    method: 'POST',
    destructive: false,
    title: translate('Terminate'),
    validators: [validateOfferingState('OK', 'Erred'), validatePermissions],
    isVisible: !marketplaceIsVisible(),
  };
}
