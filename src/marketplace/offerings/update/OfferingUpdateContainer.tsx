import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import Axios from 'axios';
import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getCategory,
  getPlugins,
  getProviderOffering,
} from '@waldur/marketplace/common/api';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { OfferingDetailsHeader } from '../details/OfferingDetailsHeader';
import { OfferingImagesList } from '../images/OfferingImagesList';

import { AttributesSection } from './attributes/AttributesSection';
import { ComponentsSection } from './components/ComponentsSection';
import { IntegrationSection } from './integration/IntegrationSection';
import { OfferingOptionsSection } from './options/OfferingOptionsSection';
import { OverviewSection } from './overview/OverviewSection';
import { PlansSection } from './plans/PlansSection';

import '../details/OfferingDetails.scss';

const getOfferingData = async (offering_uuid) => {
  const offering = await getProviderOffering(offering_uuid);
  const plugins = await getPlugins();
  const components = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).components;
  const category = await getCategory(offering.category_uuid);
  const offeringScope = offering.scope;
  let provider;
  if (offeringScope) {
    provider = (await Axios.get(offeringScope)).data;
  }
  return { offering, category, provider, components };
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type OfferingData = Awaited<ReturnType<typeof getOfferingData>>;

export const OfferingUpdateContainer = () => {
  const {
    params: { offering_uuid },
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
      <div className="provider-offering-hero__background"></div>
      <div className="container-xxl position-relative py-16">
        <Row>
          <Col md={12}>
            <OfferingDetailsHeader
              offering={data.offering}
              category={data.category}
              refetch={refetch}
            />

            <OverviewSection offering={data.offering} refetch={refetch} />

            <IntegrationSection
              offering={data.offering}
              provider={data.provider}
              refetch={refetch}
            />

            <OfferingOptionsSection
              offering={data.offering}
              refetch={refetch}
            />

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
          </Col>
        </Row>
      </div>
    </div>
  );
};
