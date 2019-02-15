import { cacheInvalidationFactory } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { ResourceAction } from '@waldur/resource/actions/types';

import { Offering } from '../types';
import { validatePermissions, validateOfferingState } from './utils';

export default function createAction(): ResourceAction<Offering> {
  return {
    name: 'destroy',
    type: 'button',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [validateOfferingState('Terminated'), validatePermissions],
    onSuccess: cacheInvalidationFactory('offeringsService'),
    isVisible: !marketplaceIsVisible(),
  };
}
