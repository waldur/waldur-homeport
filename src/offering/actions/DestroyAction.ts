import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { ResourceAction } from '@waldur/resource/actions/types';
import { router } from '@waldur/router';

import { Offering } from '../types';

import { validatePermissions, validateOfferingState } from './utils';

export default function createAction({ resource }): ResourceAction<Offering> {
  return {
    name: 'destroy',
    type: 'button',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [validateOfferingState('Terminated'), validatePermissions],
    onSuccess: () => {
      if (resource.marketplace_category_uuid) {
        router.stateService.go('marketplace-project-resources', {
          category_uuid: resource.marketplace_category_uuid,
          uuid: resource.project_uuid,
        });
      }
    },
    isVisible: !marketplaceIsVisible(),
  };
}
