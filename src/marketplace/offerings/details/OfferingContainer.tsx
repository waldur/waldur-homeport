import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getProviderOffering,
  getCategory,
  getOfferingPlansUsage,
} from '@waldur/marketplace/common/api';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { OfferingDetails } from './OfferingDetails';

async function loadData(offering_uuid: string) {
  const [offering, plansUsage] = await Promise.all([
    getProviderOffering(offering_uuid),
    getOfferingPlansUsage(offering_uuid),
  ]);
  const category = await getCategory(offering.category_uuid);

  return { offering, category, plansUsage };
}

export const OfferingContainer: FunctionComponent = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, reInitResource] = useAsyncFn(
    () => loadData(offering_uuid),
    [offering_uuid],
  );

  useEffectOnce(() => {
    reInitResource();
  });

  useFullPage();
  useTitle(value ? value.offering.name : translate('Offering details'));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  if (!value) {
    return null;
  }

  return (
    <OfferingDetails
      offering={value.offering}
      category={value.category}
      plansUsage={value.plansUsage}
      reInitResource={reInitResource}
    />
  );
};
