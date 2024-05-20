import { FunctionComponent, useMemo } from 'react';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { useToolbarActions } from '@waldur/navigation/context';

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

  useToolbarActions(
    <Tip
      id="tip-deploy"
      label={offering.state === 'Paused' ? offering.paused_reason : null}
      placement="left"
    >
      <Link
        state={canDeploy ? 'marketplace-offering-public' : ''}
        params={{ offering_uuid: offering.uuid }}
        className={`btn btn-primary ${canDeploy ? '' : 'disabled'}`}
      >
        {translate('Deploy')}
      </Link>
    </Tip>,
  );

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
    <div className="publicOfferingDetails">
      <tabSpec.component
        offering={offering}
        category={category}
        canDeploy={canDeploy}
      />
    </div>
  ) : null;
};
