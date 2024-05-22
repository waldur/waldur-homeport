import {
  Bell,
  Headset,
  SealPercent,
  Stack,
  Tag,
  UserList,
  Warning,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getStates as getResourceStates } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { getServiceProviderStatistics } from './api';
import { ChangesAmountBadge } from './ChangesAmountBadge';
import IconPendingApproval from './icons/pending-approval.svg';
import { ProviderStatistics } from './types';

interface ProviderWidget {
  icon?: any;
  iconNode?: ReactNode;
  value: string | number;
  title: string;
  changes: number;
  active?: boolean;
  to: { state; params? };
}

const generateWidgetsData = (statistics: ProviderStatistics) => [
  {
    iconNode: <SealPercent size={40} />,
    value: statistics.active_campaigns,
    title: translate('Active campaigns'),
    changes: 0,
    to: { state: 'marketplace-provider-campaigns' },
  },
  {
    iconNode: <UserList size={40} />,
    value: statistics.current_customers,
    title: translate('Active clients'),
    changes: statistics.customers_number_change,
    to: { state: 'marketplace-provider-organizations' },
  },
  {
    iconNode: <Stack size={40} />,
    value: statistics.active_resources,
    title: translate('Active resources'),
    changes: statistics.resources_number_change,
    to: {
      state: 'marketplace-public-resources',
      params: {
        state: JSON.stringify(
          getResourceStates().filter((state) =>
            ['OK', 'Creating', 'Terminating', 'Erred'].includes(state.value),
          ),
        ),
      },
    },
  },
  {
    iconNode: <Tag size={40} />,
    value: statistics.active_and_paused_offerings,
    title: translate('Total published offerings'),
    changes: 0,
    to: {
      state: 'marketplace-vendor-offerings',
      params: { state: ['Active', 'Paused'] },
    },
  },
  {
    iconNode: <Headset size={40} />,
    value: statistics.unresolved_tickets,
    title: translate('Open support tickets'),
    changes: 0,
    active: true,
    to: { state: '#' },
  },
  {
    icon: IconPendingApproval,
    value: statistics.pending_orders,
    title: translate('Orders pending approval'),
    changes: 0,
    active: true,
    to: {
      state: 'marketplace-orders',
      params: { state: 'pending-provider' },
    },
  },
  {
    iconNode: <Bell size={40} />,
    value: 0,
    title: translate('Active notifications'),
    changes: 0,
    to: { state: '#' },
  },
  {
    iconNode: <Warning size={40} />,
    value: statistics.erred_resources,
    title: translate('Erred resources'),
    changes: 0,
    active: true,
    to: {
      state: 'marketplace-public-resources',
      params: {
        state: JSON.stringify([
          getResourceStates().find((state) => state.value === 'Erred'),
        ]),
      },
    },
  },
];

const WidgetItem: FC<{ item: ProviderWidget }> = ({ item }) => (
  <Card
    as={Link}
    state={item.to.state}
    params={item.to.params}
    className="flex-grow-1 min-h-225px border border-secondary border-hover"
  >
    <Card.Body className="py-10 px-6">
      {item.icon && (
        <span
          className={
            'svg-icon svg-icon-2tx ' +
            (item.active ? 'svg-icon-success' : 'svg-icon-gray-300')
          }
        >
          <item.icon className="mh-50px" />
        </span>
      )}
      {item.iconNode && (
        <span
          className={
            'svg-icon-2tx ' +
            (item.active ? 'svg-icon-success' : 'svg-icon-gray-300')
          }
        >
          {item.iconNode}
        </span>
      )}
      <h1 className="display-6 text-nowrap mb-0 mt-2">{item.value}</h1>
      <p className="fs-7 fw-bolder mb-5 h-40px text-dark">{item.title}</p>
      <ChangesAmountBadge changes={item.changes} />
    </Card.Body>
  </Card>
);

export const ProviderWidgets = ({ provider }) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const { loading, error, value } = useAsync(() => {
    return getServiceProviderStatistics(provider.uuid).then((res) => {
      const widgets = generateWidgetsData(res.data);
      if (!showExperimentalUiComponents) {
        return widgets.filter(
          (widget) =>
            !['Open support tickets', 'Active notifications'].includes(
              widget.title,
            ),
        );
      }
      return widgets;
    });
  }, [provider, showExperimentalUiComponents]);

  return (
    <Row>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>{translate('Unable to load data')}</>
      ) : (
        (value as ProviderWidget[]).map((item, i) => (
          <Col key={i} xs={6} md={3} lg={6} xxl={3} className="mb-6">
            <WidgetItem item={item} />
          </Col>
        ))
      )}
    </Row>
  );
};
