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
import { ProgressBar } from 'react-bootstrap';
import { Offering } from 'waldur-js-client';

// eslint-disable-next-line waldur-custom/no-direct-client-usage
import { get } from '@waldur/core/api';
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
          <ProgressBar className="shadow-none w-100 h-8px mb-5">
            {statistics.map((stat) => (
              <ProgressBar
                key={stat.state}
                variant={
                  infoState.find((c) => c.states.includes(stat.state))
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
                c.states.includes(stat.state),
              );
              const Icon = state?.icon || WarningCircleIcon;
              return (
                <Badge
                  key={stat.state}
                  variant={state?.variant || 'default'}
                  leftIcon={
                    // eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight
                    <Icon weight="bold" />
                  }
                  pill
                  outline
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

const loadData = (offering_uuid: string) =>
  get<{
    resources: Array<{ state: string; count: number }>;
    users: Array<{ state: string; count: number }>;
  }>(`/marketplace-provider-offerings/${offering_uuid}/state_counters/`);

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
              statistics={data.resources}
            />
            <InfoRow label={translate('Total users')} statistics={data.users} />
          </>
        )}
      </FormTable>
    </FormTable.Card>
  );
};
