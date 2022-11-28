import { FunctionComponent, useMemo } from 'react';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { PublicOfferingComponents } from './PublicOfferingComponents';
import { PublicOfferingDetailsBar } from './PublicOfferingDetailsBar';
import { PublicOfferingDetailsHero } from './PublicOfferingDetailsHero';
import { PublicOfferingFacility } from './PublicOfferingFacility';
import { PublicOfferingFAQ } from './PublicOfferingFAQ';
import { PublicOfferingGetHelp } from './PublicOfferingGetHelp';
import { PublicOfferingGettingStarted } from './PublicOfferingGettingStarted';
import { PublicOfferingImages } from './PublicOfferingImages';
import { PublicOfferingInfo } from './PublicOfferingInfo';
import { PublicOfferingPricing } from './PublicOfferingPricing';
import { PublicOfferingReviews } from './PublicOfferingReviews';
import './PublicOfferingDetails.scss';

interface PublicOfferingDetailsProps {
  offering: Offering;
  category: Category;
  refreshOffering;
}

export const PublicOfferingDetails: FunctionComponent<PublicOfferingDetailsProps> =
  ({ offering, category }) => {
    const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
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

    return (
      <div className="publicOfferingDetails m-b" id="general">
        <PublicOfferingDetailsHero offering={offering} category={category} />
        <PublicOfferingDetailsBar offering={offering} canDeploy={canDeploy} />
        <div className="container-xxl py-10">
          <PublicOfferingInfo offering={offering} category={category} />
          <PublicOfferingComponents offering={offering} />
          {showExperimentalUiComponents && (
            <PublicOfferingImages offering={offering} />
          )}
          {showExperimentalUiComponents && (
            <PublicOfferingGettingStarted offering={offering} />
          )}
          {showExperimentalUiComponents && <PublicOfferingFAQ />}
          {showExperimentalUiComponents && <PublicOfferingReviews />}
          <PublicOfferingPricing offering={offering} canDeploy={canDeploy} />
          <PublicOfferingFacility offering={offering} />
          {showExperimentalUiComponents && <PublicOfferingGetHelp />}
        </div>
      </div>
    );
  };
