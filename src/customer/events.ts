import { EventGroup } from '@/events/types';
import { getCustomerContext } from '@/events/utils';
import { translate } from '@/i18n';

import { CustomersEnum } from '../EventsEnums';

export const OrganizationEvents: EventGroup = {
  title: translate('Organization events'),
  context: getCustomerContext,
  events: [
    {
      key: CustomersEnum.customer_creation_succeeded,
      title: translate('Organization {customer_link} has been created.'),
    },
    {
      key: CustomersEnum.customer_deletion_succeeded,
      title: translate('Organization {customer_name} has been deleted.'),
    },
    {
      key: CustomersEnum.customer_update_succeeded,
      title: translate('Organization {customer_link} has been updated.'),
    },
  ],
};
