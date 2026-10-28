import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { ServiceProvider } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { LoadingSpinner } from '@/core/LoadingSpinner';

import { ChangesAmountBadge } from './ChangesAmountBadge';
import { loadProviderCharts } from './utils';

interface ProviderDashboardChartProps {
  provider: ServiceProvider;
}

export const ProviderDashboardChart: FunctionComponent<
  ProviderDashboardChartProps
> = ({ provider }) => {
  const { isLoading: loading, data: value } = useQuery({
    queryKey: ['ProviderDashboardChart', provider],
    queryFn: () => loadProviderCharts(provider),
  });
  if (loading) {
    return <LoadingSpinner />;
  }
  if (Array.isArray(value) && value[0]) {
    return (
      <Card className="card-bordered min-h-[225px] mb-4">
        <Card.Body>
          <div className="grid grid-cols-12 gap-x-5">
            <div className="col-span-7">
              <EChart options={value[0].options} height="100px" />
            </div>
            <div className="col-span-5">
              <h1 className="font-medium">{value[0].chart.current}</h1>
              <h5 className="font-medium uppercase mb-4">
                {value[0].chart.title}
              </h5>
              <ChangesAmountBadge
                changes={value[0].chart.changes}
                showOnInfinity
                showOnZero
              />
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }
  return null;
};
