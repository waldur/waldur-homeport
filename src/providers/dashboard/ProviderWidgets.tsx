import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';

import { ProviderStatistics } from '../types';

import { getServiceProviderStatistics } from './api';
import { ChangesAmountBadge } from './ChangesAmountBadge';

const IconAttentionTriangle = require('@waldur/providers/dashboard/icons/attention-triangle.svg');
const IconActiveCampaigns = require('@waldur/providers/dashboard/icons/campaign.svg');
const IconNotification = require('@waldur/providers/dashboard/icons/notification-bell.svg');
const IconOffering = require('@waldur/providers/dashboard/icons/offering-tag.svg');
const IconPendingApproval = require('@waldur/providers/dashboard/icons/pending-approval.svg');
const IconResource = require('@waldur/providers/dashboard/icons/provider-resource.svg');
const IconSupport = require('@waldur/providers/dashboard/icons/provider-support.svg');
const IconUser = require('@waldur/providers/dashboard/icons/provider-user.svg');

interface ProviderWidget {
  icon: any;
  value: string | number;
  title: string;
  changes: number;
  active?: boolean;
}

const generateWidgetsData = (statistics: ProviderStatistics) => [
  {
    icon: IconActiveCampaigns,
    value: statistics.active_campaigns,
    title: translate('Active campaigns'),
    changes: 0,
  },
  {
    icon: IconUser,
    value: statistics.current_customers,
    title: translate('Active clients'),
    changes: statistics.customers_number_change,
  },
  {
    icon: IconResource,
    value: statistics.active_resources,
    title: translate('Active resources'),
    changes: statistics.resources_number_change,
  },
  {
    icon: IconOffering,
    value: statistics.active_and_paused_offerings,
    title: translate('Total published offerings'),
    changes: 0,
  },
  {
    icon: IconSupport,
    value: statistics.unresolved_tickets,
    title: translate('Open support tickets'),
    changes: 0,
    active: true,
  },
  {
    icon: IconPendingApproval,
    value: statistics.pended_orders,
    title: translate('Orders pending approval'),
    changes: 0,
    active: true,
  },
  {
    icon: IconNotification,
    value: 0,
    title: translate('Active notifications'),
    changes: 0,
  },
  {
    icon: IconAttentionTriangle,
    value: statistics.erred_resources,
    title: translate('Erred resources'),
    changes: 0,
    active: true,
  },
];

const WidgetItem = ({ item }: { item: ProviderWidget }) => (
  <Card className="flex-grow-1 min-h-225px">
    <Card.Body className="py-10 px-6">
      <InlineSVG
        path={item.icon}
        className={
          'svg-icon-2tx ' +
          (item.active ? 'svg-icon-success' : 'svg-icon-gray-300')
        }
      />
      <h1 className="display-6 text-nowrap mb-0 mt-2">{item.value}</h1>
      <p className="fs-7 fw-bolder mb-5 h-40px">{item.title}</p>
      <ChangesAmountBadge changes={item.changes} />
    </Card.Body>
  </Card>
);

export const ProviderWidgets = ({ provider }) => {
  const { loading, error, value } = useAsync<ProviderWidget[]>(() => {
    return getServiceProviderStatistics(provider.uuid).then((res) => {
      return generateWidgetsData(res.data);
    });
  }, [provider]);

  return (
    <Row>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>{translate('Unable to load data')}</>
      ) : (
        value.map((item, i) => (
          <Col key={i} xs={6} md={3} lg={6} xxl={3} className="mb-6">
            <WidgetItem item={item} />
          </Col>
        ))
      )}
    </Row>
  );
};
