import { useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { Project, ResourceApiKeyStatus } from 'waldur-js-client';
import { Column, renderFieldOrDash, SimpleTable } from 'waldur-table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SegmentedControl,
  StatCardGrid,
} from 'waldur-ui';

import { LimitMeter, PAGE_CLASS, PageHeader } from '../components';
import { formatDay, formatTokens, useFormatMoney } from '../format';
import { pageStatus } from '../PageStatus';
import { sectionHref } from '../router';
import { keyName, totalCost } from '../services';
import { Trends } from '../Trends';
import { useInferenceData } from '../useInferenceData';

type Scope = 'mine' | 'all';

const DASH = '—';

/** A count the agent reported this month for one component, if any. */
const usageOf = (key: ResourceApiKeyStatus, component: string) => {
  const value = (key.current_usages as Record<string, number> | null)?.[
    component
  ];
  return value == null ? undefined : Number(value);
};

const useColumns = (): Column<ResourceApiKeyStatus>[] => {
  const formatMoney = useFormatMoney();
  return [
    {
      title: translate('Key'),
      render: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{renderFieldOrDash(keyName(row))}</span>
          <span className="text-xs text-tertiary">{row.offering_name}</span>
        </div>
      ),
    },
    {
      title: translate('Input tokens'),
      render: ({ row }) => (
        <>{renderFieldOrDash(formatTokens(usageOf(row, 'input_tokens')))}</>
      ),
    },
    {
      title: translate('Output tokens'),
      render: ({ row }) => (
        <>{renderFieldOrDash(formatTokens(usageOf(row, 'output_tokens')))}</>
      ),
    },
    {
      title: translate('Estimated cost'),
      render: ({ row }) => (
        <>{renderFieldOrDash(formatMoney(row.estimated_cost))}</>
      ),
    },
  ];
};

export const UsagePage = ({ project }: { project: Project }) => {
  const data = useInferenceData(project);
  const formatMoney = useFormatMoney();
  const columns = useColumns();
  // Someone with no key of their own (an owner looking after the project)
  // starts on everyone's: "My keys" would show an empty page.
  const [chosenScope, setScope] = useState<Scope>();
  const scope: Scope = chosenScope ?? (data.myKeys.length ? 'mine' : 'all');
  const status = pageStatus({
    ...data,
    addHref: sectionHref(project.uuid, 'add'),
  });
  const keys = scope === 'mine' ? data.myKeys : data.keys;
  const activeServices = data.services.filter(
    (service) => service.resource.state === 'OK',
  );
  const paused = keys.filter((key) => key.state === 'Paused');
  const limited = keys.filter((key) => key.spending_limit_status?.length);

  return (
    <div className={PAGE_CLASS}>
      <PageHeader
        project={project}
        title={translate('Usage & limits')}
        description={translate(
          'What the keys spent this month and how close they are to their limits. Services report every few hours, so this month is not final.',
        )}
        actions={
          <SegmentedControl
            value={scope}
            onValueChange={(value: string) => setScope(value as Scope)}
            options={[
              { value: 'mine', label: translate('My keys') },
              { value: 'all', label: translate('Every key in the project') },
            ]}
          />
        }
      />
      {status ?? (
        <>
          <StatCardGrid
            spaceless
            stats={[
              {
                label: translate('Spent this month'),
                value: formatMoney(totalCost(keys)) ?? DASH,
                footer: translate('Estimate, at the plan’s prices'),
              },
              {
                label: translate('Keys'),
                value: keys.length,
              },
              {
                label: translate('Paused keys'),
                value: paused.length,
                tone: paused.length ? 'warning' : undefined,
                footer: paused.length
                  ? paused.map(keyName).join(', ')
                  : undefined,
              },
            ]}
          />
          <Trends
            project={project}
            services={activeServices}
            userUuid={scope === 'mine' ? data.me?.uuid : undefined}
          />
          <Card>
            <CardHeader>
              <CardTitle>{translate('What the project may spend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-tertiary">
                {translate(
                  'Each service’s own limits, over every key on it. When one is reached, every key on that service pauses until it resets.',
                )}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activeServices.map(({ resource }) => (
                  <div key={resource.uuid} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">
                        {resource.offering_name}
                      </span>
                      <span className="text-sm text-secondary">
                        {formatMoney(
                          (
                            resource.current_usages as Record<
                              string,
                              number
                            > | null
                          )?.token_cost ?? 0,
                        )}
                      </span>
                    </div>
                    {resource.spending_limit_status?.length ? (
                      resource.spending_limit_status.map((limit) => (
                        <LimitMeter
                          key={`${limit.component_type}-${limit.period}`}
                          status={limit}
                        />
                      ))
                    ) : (
                      <span className="text-xs text-tertiary">
                        {translate('No limit for the project')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{translate('By key, this month')}</CardTitle>
              </CardHeader>
              <SimpleTable columns={columns} rows={keys} />
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{translate('Limits of the keys')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {limited.length ? (
                  limited.map((key) => (
                    <div key={key.uuid} className="flex flex-col gap-2">
                      <span className="text-sm font-medium">
                        {keyName(key)}
                      </span>
                      {key.spending_limit_status.map((limit) => (
                        <div
                          key={`${limit.component_type}-${limit.period}`}
                          className="flex flex-col gap-1"
                        >
                          <LimitMeter status={limit} />
                          {limit.resets_at ? (
                            <span className="text-xs text-tertiary">
                              {translate('Resets {when}', {
                                when: formatDay(limit.resets_at),
                              })}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-tertiary">
                    {translate('None of these keys has a spending limit.')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
