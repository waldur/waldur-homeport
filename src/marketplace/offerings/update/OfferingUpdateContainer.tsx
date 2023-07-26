import { useQuery } from '@tanstack/react-query';
import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import Axios from 'axios';
import { Button, Card, Col, Row } from 'react-bootstrap';

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
      <div className="provider-offering-hero__background"></div>
      <div className="container-xxl position-relative py-16">
        <Row className="mb-10">
          <Col lg={8}>
            <OfferingDetailsHeader
              offering={data.offering}
              category={data.category}
            />
          </Col>

          <Col lg={4} className="d-flex">
            <Card className="flex-grow-1">
              <Card.Body>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <OverviewSection offering={data.offering} refetch={refetch} />

        <IntegrationSection
          offering={data.offering}
          provider={data.provider}
          refetch={refetch}
        />

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
