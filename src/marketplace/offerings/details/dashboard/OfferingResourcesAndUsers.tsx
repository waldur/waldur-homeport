import {
  ArrowsClockwiseIcon,
  CheckIcon,
  ClockIcon,
  ClockUserIcon,
  InfoIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { groupBy } from 'lodash-es';
import { FC, useMemo } from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  marketplaceOfferingUsersList,
  marketplaceProviderResourcesList,
  Offering,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

interface OwnProps {
  offering: Offering;
}

const infoState = [
  { variant: 'success', states: ['OK'], icon: CheckIcon },
  {
    variant: 'warning',
    states: ['Terminating', 'Deleting', 'Error deleting'],
    icon: InfoIcon,
  },
  {
    variant: 'danger',
    states: ['Erred', 'Terminated', 'Deleted'],
    icon: XIcon,
  },
  {
    variant: 'blue',
    states: ['Creating', 'Updating', 'Error creating'],
    icon: ArrowsClockwiseIcon,
  },
  {
    variant: 'teal',
    states: ['Requested', 'Requested deletion'],
    icon: ClockIcon,
  },
  {
    variant: 'indigo',
    states: ['Pending account linking', 'Pending additional validation'],
    icon: ClockUserIcon,
  },
];

const InfoRow = ({ label, states }) => {
  const statistics = useMemo(
    () =>
      Object.entries(groupBy(states)).map((state) => ({
        label: state[0],
        count: state[1].length,
      })),
    [states],
  );
  const max = states.length;
  return (
    <>
      <FormTable.Item
        label={label}
        colon
        value={max}
        className="border-0"
        valueClass="border-0"
        actionsClass="border-0"
      />
      <tr>
        <td className="pt-0 ps-0" colSpan={3}>
          <ProgressBar className="shadow-none w-100 h-8px mb-5">
            {statistics.map((stat) => (
              <ProgressBar
                key={stat.label}
                variant={
                  infoState.find((c) => c.states.includes(stat.label))
                    ?.variant || 'default'
                }
                now={stat.count}
                max={max}
              />
            ))}
          </ProgressBar>
          <div className="d-flex flex-wrap gap-2">
            {statistics.map((stat) => {
              const state = infoState.find((c) =>
                c.states.includes(stat.label),
              );
              const Icon = state.icon || WarningCircleIcon;
              return (
                <Badge
                  key={stat.label}
                  variant={state.variant || 'default'}
                  leftIcon={
                    // eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight
                    <Icon weight="bold" />
                  }
                  pill
                  outline
                >
                  {stat.label}
                  {': '}
                  {stat.count}
                </Badge>
              );
            })}
          </div>
        </td>
      </tr>
    </>
  );
};

const loadData = async (offering_uuid) => {
  const resources = await getAllPages((page) =>
    marketplaceProviderResourcesList({
      query: { offering_uuid, page, page_size: MAX_PAGE_SIZE },
    }),
  );
  const users = await getAllPages((page) =>
    marketplaceOfferingUsersList({
      query: { offering_uuid, page, page_size: MAX_PAGE_SIZE },
    }),
  );
  return { resources, users };
};

export const OfferingResourcesAndUsers: FC<OwnProps> = ({ offering }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ResourcesAndUsersStat', offering.uuid],
    queryFn: () => loadData(offering.uuid),
    staleTime: 3 * 60 * 1000,
  });

  return (
    <FormTable.Card
      title={translate('Resources & users')}
      className="card-bordered mb-5"
      headerClassName="min-h-60px"
    >
      <FormTable detailsMode className="gy-5">
        {isLoading || error ? (
          <tr>
            <td colSpan={3}>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <LoadingErred loadData={refetch} />
              ) : null}
            </td>
          </tr>
        ) : (
          <>
            <InfoRow
              label={translate('Total resources')}
              states={data.resources.map((item) => item.state)}
            />
            <InfoRow
              label={translate('Total users')}
              states={data.users.map((item) => item.state)}
            />
          </>
        )}
      </FormTable>
    </FormTable.Card>
  );
};
