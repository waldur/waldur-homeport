import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import {
  WizardFinalForm,
  WizardFinalFormStepProps,
} from '@waldur/form/WizardFinalForm';

import { ChangeLimitsComponent } from '../change-limits/ChangeLimitsComponent';
import { getData, loadData } from '../change-limits/utils';

import { RenewAllocationFormData } from './types';

interface OwnProps extends WizardFinalFormStepProps {
  data: { resources: Array<Resource & { marketplace_resource_uuid }> };
}

const getUuid = (resource) =>
  resource.marketplace_resource_uuid || resource.uuid;

const UpdateLimitsTable: FC<{
  resource: OwnProps['data']['resources'][0];
}> = (props) => {
  const resource = props.resource;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ChangeLimitsData', getUuid(resource)],
    queryFn: () => loadData(getUuid(resource)),
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const { values } = useFormState<RenewAllocationFormData>();

  const tableData = useMemo(() => {
    if (data) {
      const newLimits = values[getUuid(resource)].limits;
      const { offering, plan, usages, limits: currentLimits } = data;
      return getData(plan, offering, newLimits, currentLimits, usages, true);
    }
    const shouldConcealPrices = isFeatureVisible(
      MarketplaceFeatures.conceal_prices,
    );
    return {
      periods: [],
      components: [],
      totalPeriods: [],
      changedTotalPeriods: [],
      orderCanBeApproved: true,
      offering: null,
      shouldConcealPrices,
    };
  }, [data, values]);

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred loadData={refetch} />
  ) : (
    <ChangeLimitsComponent
      plan={data.plan}
      periods={tableData.periods}
      components={tableData.components}
      orderCanBeApproved={tableData.orderCanBeApproved}
      totalPeriods={tableData.totalPeriods}
      changedTotalPeriods={tableData.changedTotalPeriods}
      offeringLimits={data.offeringLimits}
      shouldConcealPrices={tableData.shouldConcealPrices}
      parentName={getUuid(resource)}
      finalForm
    />
  );
};

export const Step1UpdateLimits: FC<OwnProps> = (props) => {
  const resources = props.data.resources;
  const isMulti = resources?.length > 1;

  return (
    <WizardFinalForm {...props}>
      {isMulti ? (
        <Tabs
          id="resources-limits-change"
          className="nav nav-stretch nav-line-tabs mb-4"
          unmountOnExit
          mountOnEnter
        >
          {resources.map((resource) => (
            <Tab
              key={resource.uuid}
              eventKey={getUuid(resource)}
              title={resource.name}
            >
              <UpdateLimitsTable resource={resource} />
            </Tab>
          ))}
        </Tabs>
      ) : (
        <UpdateLimitsTable resource={resources[0]} />
      )}
    </WizardFinalForm>
  );
};
