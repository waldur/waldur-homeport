import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { startCase } from 'lodash-es';
import React from 'react';
import {
  marketplacePluginsList,
  marketplacePublicOfferingsRetrieve,
  Offering,
} from 'waldur-js-client';

import { usePermissionView } from '@/auth/PermissionLayout';
import { formatDate, parseDate } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { goToNotFound } from '@/error/utils';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { useProject } from '@/workspace/hooks';

import { DeployPage } from '../deploy/DeployPage';

async function loadData(offering_uuid: string) {
  const offering = (await marketplacePublicOfferingsRetrieve({
    path: { uuid: offering_uuid },
  }).then((response) => response.data)) as Offering;
  const plugins = await marketplacePluginsList();
  const pluginLimits = plugins.data.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  const limits = offering.effective_available_limits || pluginLimits;
  return { offering, limits };
}

export const OfferingDetailsPage: React.FC = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const {
    isLoading: loading,
    data: value,
    error,
  } = useQuery({
    queryKey: ['DetailsPage', offering_uuid],
    queryFn: () => loadData(offering_uuid),
  });

  useTitle(
    value?.offering?.category_title
      ? translate('Add {category}', {
          category: startCase(value.offering.category_title.toLowerCase()),
        })
      : translate('Add resource'),
  );

  const project = useProject();
  usePermissionView(() => {
    if (project?.end_date) {
      const endDate = parseDate(project.end_date);
      const now = parseDate(null);
      const options =
        !loading && !error ? { className: 'deploy-page-banner' } : undefined;
      if (endDate.hasSame(now, 'day') || endDate < now) {
        return {
          permission: 'restricted',
          banner: {
            title: translate('Project has reached its end date {date}', {
              date: formatDate(endDate),
            }),
            message: translate(
              'New resources cannot be scheduled for creation.',
            ),
            options,
          },
        };
      } else {
        return {
          permission: 'limited',
          banner: {
            title: translate('Project end date is {date}', {
              date: formatDate(endDate),
            }),
            message: translate(
              'All resources will be scheduled for termination once the date is reached.',
            ),
            options,
          },
        };
      }
    }
    return null;
  }, [project, loading, error]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  if (value.offering.state !== 'Active') {
    goToNotFound();
    return null;
  }

  return <DeployPage offering={value.offering} />;
};
