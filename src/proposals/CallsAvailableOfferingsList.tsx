import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { translate } from '@waldur/i18n';
import { getAllProviderOfferings } from '@waldur/marketplace/common/api';
import { AvailableOfferingCard } from '@waldur/proposals/AvailableOfferingCard';

export const CallsAvailableOfferingsList: FC = () => {
  const {
    data: availableOfferings,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['CallsAvailableOfferingsList'],
    () => getAllProviderOfferings({ params: { accessible_via_calls: true } }),
    {
      staleTime: 3 * 60 * 1000,
    },
  );
  return (
    <div>
      {isLoading ? (
        <p className="text-center">{translate('Loading')}</p>
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : availableOfferings.length === 0 ? (
        <p className="text-center">
          {translate('There are no available offerings at the moment.')}
        </p>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">{translate('Available offerings')}</h1>
            <div>
              <Link
                state="calls-for-proposals-all-available-offerings"
                label={translate('View all')}
              />
            </div>
          </div>
          <div className="row d-flex flex-wrap mt-6">
            {availableOfferings.map((availableOffering, index: number) => (
              <Col key={availableOffering.uuid} lg={6} xl={4} className="mb-3">
                <AvailableOfferingCard
                  key={index}
                  availableOffering={availableOffering}
                />
              </Col>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
