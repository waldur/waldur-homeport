import { useState } from 'react';
import { ChartSpecView } from 'waldur-charts';
import { translate } from 'waldur-i18n-runtime';
import { Project } from 'waldur-js-client';
import { useShellTheme } from 'waldur-shell';
import {
  AlertItem,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  NativeSelect,
  SegmentedControl,
  StatCardGrid,
} from 'waldur-ui';

import { formatDay, useFormatMoney } from './format';
import { useKeyInsights } from './queries';
import { InferenceService } from './useInferenceData';

const PERIODS = [7, 30, 90] as const;
const ALL = '';
const DASH = '—';

/**
 * How spend moves over time, from the API keys' daily usage: the recent
 * pace, the month's forecast and, for one service, when its month limit is
 * reached, with the backend's charts. The same charts the assistant draws.
 */
export const Trends = ({
  project,
  services,
  userUuid,
}: {
  project: Project;
  services: InferenceService[];
  /** Only this person's keys; every key in the project when undefined. */
  userUuid?: string;
}) => {
  const { theme } = useShellTheme();
  const formatMoney = useFormatMoney();
  const [days, setDays] = useState<(typeof PERIODS)[number]>(30);
  const [serviceUuid, setServiceUuid] = useState(ALL);
  const insights = useKeyInsights({
    projectUuid: project.uuid,
    resourceUuid: serviceUuid || undefined,
    userUuid,
    days,
  });
  const data = insights.data;

  return (
    <Card>
      <CardHeader className="flex-wrap gap-3">
        <CardTitle>{translate('Trends')}</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          {services.length > 1 ? (
            <NativeSelect
              aria-label={translate('Service')}
              value={serviceUuid}
              onChange={(event) => setServiceUuid(event.target.value)}
              fit
            >
              <option value={ALL}>{translate('All services')}</option>
              {services.map(({ resource }) => (
                <option key={resource.uuid} value={resource.uuid}>
                  {resource.offering_name}
                </option>
              ))}
            </NativeSelect>
          ) : null}
          <SegmentedControl
            value={String(days)}
            onValueChange={(value: string) =>
              setDays(Number(value) as (typeof PERIODS)[number])
            }
            options={PERIODS.map((period) => ({
              value: String(period),
              label: translate('{days} days', { days: period }),
            }))}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {insights.isLoading ? (
          <LoadingSpinner />
        ) : insights.isError || !data ? (
          <AlertItem
            variant="error"
            title={translate('Could not load the trends')}
            body={translate('Check your connection and try again.')}
          />
        ) : (
          <>
            <StatCardGrid
              spaceless
              stats={[
                {
                  label: translate('Pace'),
                  value: formatMoney(data.daily_pace) ?? DASH,
                  footer: translate('a day, over the last 7 days'),
                },
                {
                  label: translate('This month at this pace'),
                  value: formatMoney(data.forecast_this_month) ?? DASH,
                  footer: translate('{spent} so far', {
                    spent: formatMoney(data.spent_this_month) ?? DASH,
                  }),
                },
                {
                  label: translate('Month limit reached'),
                  value: data.runs_out
                    ? formatDay(data.runs_out)
                    : data.month_limit
                      ? translate('Not this month')
                      : DASH,
                  tone: data.runs_out ? 'warning' : undefined,
                  footer: data.month_limit
                    ? translate('of {limit}', {
                        limit: formatMoney(data.month_limit),
                      })
                    : !serviceUuid
                      ? translate('Choose a service to see its limit')
                      : userUuid
                        ? // The limit holds every key's spend, not just mine.
                          translate('Shown for every key in the project')
                        : translate('This service has no month limit'),
                },
              ]}
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {data.charts.map((chart, index) => (
                // The month's chart reads best across the row.
                <div
                  key={chart.title}
                  className={index === 0 ? 'lg:col-span-2' : undefined}
                >
                  <ChartSpecView spec={chart} theme={theme} />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
