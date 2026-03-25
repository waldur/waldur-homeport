import {
  ChartLineUpIcon,
  CubeIcon,
  PackageIcon,
  ShoppingCartIcon,
  TicketIcon,
  UsersThreeIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceServiceProvidersStatRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';

interface KPICardProps {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: number | string;
  change?: number;
}

const KPICard: FC<KPICardProps> = ({
  icon,
  iconColor,
  label,
  value,
  change,
}) => (
  <div className="card card-flush h-100">
    <div className="card-body d-flex align-items-center py-5">
      <div
        className="d-flex align-items-center justify-content-center rounded-circle me-4"
        style={{
          width: 50,
          height: 50,
          backgroundColor: `${iconColor}15`,
        }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div>
        <div className="fs-2 fw-bold">{value}</div>
        <div className="text-muted fs-7">{label}</div>
        {change !== undefined && (
          <div
            className={`fs-8 ${change >= 0 ? 'text-success' : 'text-danger'}`}
          >
            {change >= 0 ? '+' : ''}
            {change} {translate('this month')}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ProviderOverviewContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-overview', providerUuid],
    queryFn: async () => {
      const response = await marketplaceServiceProvidersStatRetrieve({
        path: { uuid: providerUuid },
      });
      return response.data;
    },
    enabled: !!providerUuid,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  return (
    <Row className="g-4">
      <Col xs={12} sm={6} lg={3}>
        <KPICard
          icon={<CubeIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Active resources')}
          value={data.active_resources}
          change={data.resources_number_change}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <KPICard
          icon={<UsersThreeIcon size={24} weight="bold" />}
          iconColor="#50cd89"
          label={translate('Current customers')}
          value={data.current_customers}
          change={data.customers_number_change}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <KPICard
          icon={<PackageIcon size={24} weight="bold" />}
          iconColor="#7239ea"
          label={translate('Active offerings')}
          value={data.active_and_paused_offerings}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <KPICard
          icon={<ChartLineUpIcon size={24} weight="bold" />}
          iconColor="#ffc700"
          label={translate('Active campaigns')}
          value={data.active_campaigns}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <KPICard
          icon={<ShoppingCartIcon size={24} weight="bold" />}
          iconColor="#f1416c"
          label={translate('Pending orders')}
          value={data.pending_orders}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <KPICard
          icon={<WarningCircleIcon size={24} weight="bold" />}
          iconColor="#f1416c"
          label={translate('Erred resources')}
          value={data.erred_resources}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <KPICard
          icon={<TicketIcon size={24} weight="bold" />}
          iconColor="#ffa800"
          label={translate('Unresolved tickets')}
          value={data.unresolved_tickets}
        />
      </Col>
    </Row>
  );
};

export const ProviderOverviewPage: FC = () => {
  useTitle(translate('Provider overview'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'overview' });

  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Provider')}
          className="flex-grow-1 mw-300px"
        >
          <ProviderFilter />
        </FormGroup>
      </div>

      {providerUuid ? (
        <ProviderOverviewContent providerUuid={providerUuid} />
      ) : (
        <NoResult
          title={translate('Select a provider')}
          message={translate(
            'Choose a provider from the dropdown above to view statistics.',
          )}
          noAction
        />
      )}
    </>
  );
};
