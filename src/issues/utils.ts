import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Issue } from 'waldur-js-client';

import { IBreadcrumbItem } from 'waldur-ui';

import { getUUID } from '@/core/utils';
import { PeriodOption } from '@/form/types';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { usePresetBreadcrumbItems } from '@/navigation/header/breadcrumb/utils';

export const getStartAndEndDatesOfMonth = (period: PeriodOption) => {
  const { year, month } = period;
  const dt = DateTime.fromObject({ year, month });
  return {
    start: dt.startOf('month').toISODate(),
    end: dt.endOf('month').toISODate(),
  };
};

export const makeLastTwelveMonthsFilterPeriodsAsCreatedRange = () => {
  const choices = makeLastTwelveMonthsFilterPeriods();
  return choices.map((choice) => {
    const { start, end } = getStartAndEndDatesOfMonth(choice.value);
    return {
      label: choice.label,
      value: {
        created_after: start,
        created_before: end,
      },
    };
  });
};

export const useIssueBreadcrumbItems = (issue: Issue): IBreadcrumbItem[] => {
  const isUser =
    issue && !issue.customer_uuid && !issue.project_uuid && !issue.resource;

  const { getOrganizationBreadcrumbItem, getProjectBreadcrumbItem } =
    usePresetBreadcrumbItems();

  return useMemo(
    () =>
      [
        issue?.customer_uuid &&
          getOrganizationBreadcrumbItem(
            { uuid: issue.customer_uuid, name: issue.customer_name },
            { maxLength: 20 },
          ),
        issue?.project_uuid &&
          getProjectBreadcrumbItem(
            {
              url: issue.project,
              uuid: issue.project_uuid,
              name: issue.project_name,
              customer_uuid: issue.customer_uuid,
              customer_name: issue.customer_name,
            },
            { maxLength: 20 },
          ),
        issue?.resource && {
          key: 'resource',
          text: issue.resource_name,
          to: 'marketplace-resource-details',
          params: { resource_uuid: getUUID(issue.resource) },
          maxLength: 20,
        },
        isUser && {
          key: 'user',
          text: issue?.caller_full_name || '...',
          to: 'support-user-manage',
          params: { user_uuid: issue?.caller_uuid },
          maxLength: 30,
        },
        {
          key: 'issue',
          text: issue
            ? issue.key
              ? `${issue.key}: ${issue.summary}`
              : issue.summary
            : '...',
          truncate: true,
          active: true,
        },
      ].filter(Boolean) as IBreadcrumbItem[],
    [issue],
  );
};

const HTML_TAG = /<\/?[a-z][^>]*>/i;

/**
 * Waldur's own helpdesk keeps a description as the issue form's textarea had
 * it: plain text, whose lines HTML would join. Text that is HTML already
 * (SMAX, a Zammad agent's reply) keeps its own markup.
 */
export const withLineBreaks = (text = '') =>
  HTML_TAG.test(text) ? text : text.replace(/\r?\n/g, '<br/>');

export const linkify = (s) =>
  s.replace(
    /\[(.+?)\|([^\]]+)\]/g,
    (_, name, href) => `<a href="${href}">${name}</a>`,
  );
