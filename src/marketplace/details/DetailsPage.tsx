import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { startCase } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { formatDate, parseDate } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { formProjectSelector } from '@waldur/marketplace/deploy/utils';
import { useTitle } from '@waldur/navigation/title';

import { getPlugins, getPublicOffering } from '../common/api';
import { DeployPage } from '../deploy/DeployPage';

async function loadData(offering_uuid: string) {
  const offering = await getPublicOffering(offering_uuid);
  const plugins = await getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  return { offering, limits };
}

export const OfferingDetailsPage: React.FC = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const router = useRouter();

  const { loading, value, error } = useAsync(
    () => loadData(offering_uuid),
    [offering_uuid],
  );

  useTitle(
    value?.offering?.category_title
      ? translate('Add {category}', {
          category: startCase(value.offering.category_title.toLowerCase()),
        })
      : translate('Add resource'),
  );

  const project = useSelector(formProjectSelector);
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
    router.stateService.go('errorPage.notFound');
    return null;
  }

  return <DeployPage offering={value.offering} limits={value.limits} />;
};
