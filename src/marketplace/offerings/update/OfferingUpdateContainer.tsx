import { useQuery } from '@tanstack/react-query';
import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import { Button } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getCategory,
  getPlugins,
  getProviderOffering,
} from '@waldur/marketplace/common/api';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { isDescendantOf } from '@waldur/navigation/useTabs';

import { OfferingStateActions } from '../actions/OfferingStateActions';
import { OfferingDetailsHeader } from '../details/OfferingDetailsHeader';
import { OfferingImagesList } from '../images/OfferingImagesList';
import { PreviewButton } from '../PreviewButton';

import { AttributesSection } from './attributes/AttributesSection';
import { ComponentsSection } from './components/ComponentsSection';
import { OfferingEndpointsSection } from './endpoints/OfferingEndpointsSection';
import { IntegrationSection } from './integration/IntegrationSection';
import { OfferingUpdateBar } from './OfferingUpdateBar';
import { OfferingOptionsSection } from './options/OfferingOptionsSection';
import { OverviewSection } from './overview/OverviewSection';
import { PlansSection } from './plans/PlansSection';

const getOfferingData = async (offering_uuid) => {
  const offering = await getProviderOffering(offering_uuid);
  const plugins = await getPlugins();
  const components = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).components;
  const category = await getCategory(offering.category_uuid);
  return { offering, category, components };
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type OfferingData = Awaited<ReturnType<typeof getOfferingData>>;

export const OfferingUpdateContainer = () => {
  const {
    params: { offering_uuid },
    state,
  } = useCurrentStateAndParams();

  const { data, isLoading, error, refetch } = useQuery(
    ['OfferingUpdateContainer', offering_uuid],
    () => getOfferingData(offering_uuid),
  );

  useFullPage();
  useTitle(data ? data.offering.name : translate('Offering details'));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="provider-offering">
      <OfferingDetailsHeader
        offering={data.offering}
        category={data.category}
        secondaryActions={
          <div className="d-flex">
            <div className="flex-grow-1">
              <UISref
                to={
                  isDescendantOf('admin', state)
                    ? 'admin.marketplace-offering-details'
                    : 'marketplace-offering-details'
                }
                params={{
                  offering_uuid: data.offering.uuid,
                  uuid: data.offering.customer_uuid,
                }}
              >
                <a className="btn btn-sm me-2 btn-light">
                  {translate('Manage')}
                </a>
              </UISref>
              <PreviewButton offering={data.offering} />
            </div>
            <div>
              <OfferingStateActions
                offering={data.offering}
                refreshOffering={refetch}
              />
              <Button
                variant="light"
                size="sm"
                className="btn-icon me-2"
                onClick={() => refetch()}
              >
                <i className="fa fa-refresh" />
              </Button>
            </div>
          </div>
        }
      />
      <OfferingUpdateBar offering={data.offering} />
      <div className="container-xxl py-10">
        <OverviewSection offering={data.offering} refetch={refetch} />

        <IntegrationSection offering={data.offering} refetch={refetch} />

        <OfferingEndpointsSection offering={data.offering} refetch={refetch} />

        <OfferingOptionsSection offering={data.offering} refetch={refetch} />

        <AttributesSection
          offering={data.offering}
          category={data.category}
          refetch={refetch}
        />

        <ComponentsSection
          offering={data.offering}
          components={data.components}
          refetch={refetch}
        />

        <PlansSection offering={data.offering} refetch={refetch} />

        <OfferingImagesList offering={data.offering} />
      </div>
    </div>
  );
};
