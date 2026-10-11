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
import { FC } from 'react';
import {
  marketplaceProviderOfferingsStateCountersRetrieve,
  Offering,
} from 'waldur-js-client';

import { Badge, Progress, type ProgressVariant } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

interface OwnProps {
  offering: Offering;
}

const infoState: Array<{
  variant: ProgressVariant;
  states: string[];
  icon: any;
}> = [
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

const InfoRow = ({
  label,
  statistics,
}: {
  label: string;
  statistics: Array<{ state: string; count: number }>;
}) => {
  const max = statistics.reduce((acc, item) => acc + item.count, 0);
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
          <Progress
            className="mb-5"
            max={max}
            segments={statistics.map((stat) => ({
              value: stat.count,
              variant:
                infoState.find((c) => c.states.includes(stat.state))?.variant ||
                'neutral',
            }))}
          />
          <div className="d-flex flex-wrap gap-2">
            {statistics.map((stat) => {
              const state = infoState.find((c) =>
                c.states.includes(stat.state),
              );
              const Icon = state?.icon || WarningCircleIcon;
              return (
                <Badge
                  key={stat.state}
                  variant={state?.variant || 'neutral'}
                  leftIcon={
                    // eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight
                    <Icon weight="bold" />
                  }
                  shape="pill"
                  tone="outline"
                >
                  {stat.state}
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

export const OfferingResourcesAndUsers: FC<OwnProps> = ({ offering }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ResourcesAndUsersStat', offering.uuid],
    queryFn: () =>
      marketplaceProviderOfferingsStateCountersRetrieve({
        path: { uuid: offering.uuid },
      }).then((r) => r.data),
    staleTime: UI_STALE_TIME,
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
              statistics={data.resources}
            />
            <InfoRow label={translate('Total users')} statistics={data.users} />
          </>
        )}
      </FormTable>
    </FormTable.Card>
  );
};
