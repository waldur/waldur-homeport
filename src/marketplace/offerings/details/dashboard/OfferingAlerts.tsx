import {
  InfoIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

interface OwnProps {
  offering: Offering;
}

const dummyData = () => [
  {
    uuid: uniqueId(),
    type: 'warning',
    title: 'Component - mup_backend',
    description: 'Response time above threshold',
    created: '2025-01-15T09:46:36.701555+00:00',
  },
  {
    uuid: uniqueId(),
    type: 'error',
    title: 'Error 1',
    description: 'Test description',
    created: '2025-01-15T08:43:36.701555+00:00',
  },
  {
    uuid: uniqueId(),
    type: 'info',
    title: 'Information 1',
    description: 'Test description',
    created: '2025-01-14T11:36:32.701555+00:00',
  },
  {
    uuid: uniqueId(),
    type: 'warning',
    title: 'Component - mup_backend',
    description: 'Response time above threshold',
    created: '2025-01-14T09:46:36.701555+00:00',
  },
  {
    uuid: uniqueId(),
    type: 'info',
    title: 'Information 2',
    description: 'Test description 2',
    created: '2025-01-14T07:36:32.701555+00:00',
  },
];

const offeringAlertIcon = {
  info: { icon: InfoIcon, variant: 'default' },
  warning: { icon: WarningCircleIcon, variant: 'warning' },
  error: { icon: WarningOctagonIcon, variant: 'danger' },
};

const OfferingAlertItem: FC<{ row }> = ({ row }) => {
  return (
    <div className="d-flex gap-5 border-bottom pb-5">
      {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
      <FeaturedIcon
        IconComponent={offeringAlertIcon[row.type].icon}
        size="lg"
        variant={offeringAlertIcon[row.type].variant}
      />
      <div>
        <h6 className="mb-1 fw-bold">
          {row.title}
          <small className="text-muted fw-normal ms-2">
            {formatDateTime(row.created)}
          </small>
        </h6>
        <span className="text-muted fs-6">{row.description}</span>
      </div>
    </div>
  );
};

export const OfferingAlerts: FC<OwnProps> = () => {
  const tableProps = useTable({
    table: 'OfferingAlerts',
    // FIX THIS
    // fetchData: createFetcher(offeringAlerts),
    fetchData: () => Promise.resolve({ rows: dummyData(), resultCount: 30 }),
  });

  return (
    <Table
      {...tableProps}
      showPageSizeSelector
      title={translate('Alerts')}
      verboseName={translate('Alerts')}
      className="mb-5"
      headerClassName="min-h-60px"
      fullWidth
      hideRefresh
      gridItem={OfferingAlertItem}
      gridSize={{ xs: 12 }}
      gridSpace={5}
      initialMode="grid"
    />
  );
};
