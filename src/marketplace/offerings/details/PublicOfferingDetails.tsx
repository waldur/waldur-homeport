import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';

import { usePermissionView } from '@/auth/PermissionLayout';
import { translate } from '@/i18n';
import { Category, Offering } from '@/marketplace/types';

interface PublicOfferingDetailsProps {
  offering: Offering;
  category: Category;
  refreshOffering;
  tabSpec;
}

export const PublicOfferingDetails: FunctionComponent<
  PublicOfferingDetailsProps
> = ({ offering, category, tabSpec }) => {
  const canDeploy = useMemo(() => offering.state === 'Active', [offering]);

  usePermissionView(() => {
    switch (offering.state) {
      case 'Paused':
        return {
          permission: 'limited',
          banner: {
            title: translate('Paused'),
            message: translate(
              'This offering has been paused and new resources cannot be added at the moment.',
            ),
          },
        };
      case 'Draft':
        return {
          permission: 'limited',
          banner: {
            title: translate('Draft'),
            message: translate(
              'This offering has not been activated by the operator yet.',
            ),
          },
        };
      case 'Archived':
        return {
          permission: 'limited',
          banner: {
            title: translate('Archived'),
            message: translate('This offering has been archived.'),
          },
        };

      default:
        return null;
    }
  }, [offering]);

  return tabSpec ? (
    <div
      className={classNames(
        'publicOfferingDetails',
        offering.state === 'Unavailable' && 'disabled-view',
      )}
    >
      <tabSpec.component
        offering={offering}
        category={category}
        canDeploy={canDeploy}
      />
    </div>
  ) : null;
};
