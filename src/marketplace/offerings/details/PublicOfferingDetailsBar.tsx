import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';
import { Offering } from '@waldur/marketplace/types';

interface OwnProps {
  offering: Offering;
  canDeploy?: boolean;
}

const tabs: PageBarTab[] = [
  { key: 'general', title: translate('General') },
  { key: 'description', title: translate('Description') },
  { key: 'components', title: translate('Components') },
  {
    key: 'images',
    title: translate('Images'),
  },
  {
    key: 'getting-started',
    title: translate('Getting started'),
  },
  {
    key: 'faq',
    title: translate('FAQ'),
  },
  { key: 'reviews', title: translate('Reviews') },
  { key: 'pricing', title: translate('Pricing') },
];

export const PublicOfferingDetailsBar: FC<OwnProps> = ({
  offering,
  canDeploy = true,
}) => {
  return (
    <PageBarTabs
      tabs={tabs}
      right={
        <Tip
          id="tip-deploy"
          label={offering.state === 'Paused' ? offering.paused_reason : null}
          placement="left"
        >
          <Link
            state={canDeploy ? 'marketplace-offering-user' : ''}
            params={{ offering_uuid: offering.uuid }}
            className={`btn btn-primary ${canDeploy ? '' : 'disabled'}`}
          >
            {translate('Deploy')}
          </Link>
        </Tip>
      }
    />
  );
};
