import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { PlanUsageRow } from '@waldur/reporting/plan-usage/types';

import { PreviewButton } from '../list/PreviewButton';

import { OfferingDetailsBar } from './OfferingDetailsBar';
import { OfferingDetailsHeader } from './OfferingDetailsHeader';
import { OfferingDetailsStatistics } from './OfferingDetailsStatistics';
import { OfferingTables } from './OfferingTables';

export interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
  plansUsage: PlanUsageRow[];
  refetch(): void;
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => {
  const { state } = useCurrentStateAndParams();
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return (
    <div className="provider-offering">
      <OfferingDetailsHeader
        offering={props.offering}
        category={props.category}
        secondaryActions={
          <div className="d-flex">
            <div className="flex-grow-1">
              <UISref
                to={
                  isDescendantOf('admin', state)
                    ? 'admin.marketplace-offering-update'
                    : 'marketplace-offering-update'
                }
                params={{
                  offering_uuid: props.offering.uuid,
                  uuid: props.offering.customer_uuid,
                }}
              >
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="btn btn-light btn-sm me-2">{translate('Edit')}</a>
              </UISref>
              <PreviewButton offering={props.offering} />
            </div>

            <Button
              variant="light"
              size="sm"
              className="btn-icon me-2"
              onClick={props.refetch}
            >
              <i className="fa fa-refresh" />
            </Button>
          </div>
        }
      />
      <OfferingDetailsBar
        integrationStatus={props.offering.integration_status}
      />
      {showExperimentalUiComponents && <OfferingDetailsStatistics />}
      <div className="container-xxl py-10">
        <OfferingTables
          offering={props.offering}
          plansUsage={props.plansUsage}
        />
      </div>
    </div>
  );
};
