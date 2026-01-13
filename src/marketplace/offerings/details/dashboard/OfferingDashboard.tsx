import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import {
  AgentIdentity,
  marketplaceSiteAgentIdentitiesList,
  Offering,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { ComponentsUsage } from './ComponentsUsage';
import { OfferingAgentInfo } from './OfferingAgentInfo';
import { OfferingAlerts } from './OfferingAlerts';
import { OfferingResourcesAndUsers } from './OfferingResourcesAndUsers';
import { OfferingServices } from './OfferingServices';

interface OwnProps {
  offering: Offering;
}

export const OfferingDashboard: FC<OwnProps> = ({ offering }) => {
  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.xl });

  const [agentIdentity, setAgentIdentity] = useState(null);

  const {
    data: agentIdentities,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['offeringAgentIdentities', offering.uuid],
    queryFn: () =>
      getAllPages<AgentIdentity>((page) =>
        marketplaceSiteAgentIdentitiesList({
          query: {
            offering_uuid: offering.uuid,
            page_size: MAX_PAGE_SIZE,
            page,
          },
        }),
      ),
    staleTime: 3 * 60 * 1000,
  });

  useEffect(() => {
    if (agentIdentity === null && agentIdentities) {
      setAgentIdentity(agentIdentities?.[0]);
    }
  }, [agentIdentities]);

  const showAgentData = !isLoading && !error && agentIdentity;
  const isAgentDataEmpty = !isLoading && !error && !agentIdentity;
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <>
      <ComponentsUsage offering={offering} />

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} className="mb-4" />
      ) : null}

      {isSmallScr ? (
        <>
          {showAgentData ? (
            <>
              <OfferingAgentInfo
                agentIdentities={agentIdentities}
                agentIdentity={agentIdentity}
                setAgentIdentity={setAgentIdentity}
              />
              <OfferingResourcesAndUsers offering={offering} />
              <OfferingServices agentIdentity={agentIdentity} />
            </>
          ) : (
            isAgentDataEmpty && <OfferingAgentInfo empty />
          )}
          {showExperimentalUiComponents && (
            <OfferingAlerts offering={offering} />
          )}
        </>
      ) : (
        <Row>
          <Col md={6}>
            {showAgentData && (
              <OfferingAgentInfo
                agentIdentities={agentIdentities}
                agentIdentity={agentIdentity}
                setAgentIdentity={setAgentIdentity}
              />
            )}
            <OfferingResourcesAndUsers offering={offering} />
          </Col>
          <Col md={6}>
            {showAgentData ? (
              <OfferingServices agentIdentity={agentIdentity} />
            ) : (
              isAgentDataEmpty && <OfferingAgentInfo empty />
            )}
            {showExperimentalUiComponents && (
              <OfferingAlerts offering={offering} />
            )}
          </Col>
        </Row>
      )}
    </>
  );
};
