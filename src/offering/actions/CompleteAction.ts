import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { ResourceAction } from '@waldur/resource/actions/types';

import { Offering } from '../types';
import { validatePermissions, validateOfferingState } from './utils';

export default function createAction(): ResourceAction<Offering> {
  return {
    name: 'complete',
    type: 'form',
    method: 'POST',
    title: translate('Complete'),
    validators: [validateOfferingState('Requested'), validatePermissions],
    isVisible: !marketplaceIsVisible(),
    fields: [
      {
        name: 'unit_price',
        label: translate('Unit price'),
        required: true,
        type: 'decimal',
      },
      {
        name: 'unit',
        type: 'select',
        label: translate('Unit'),
        choices: [
          {
            display_name: translate('Per month'),
            value: 'month',
          },
          {
            display_name: translate('Per half month'),
            value: 'half_month',
          },
          {
            display_name: translate('Per day'),
            value: 'day',
          },
          {
            display_name: translate('Per hour'),
            value: 'hour',
          },
          {
            display_name: translate('Quantity'),
            value: 'quantity',
          },
        ],
      },
    ],
  };
}
