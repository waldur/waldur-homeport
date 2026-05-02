import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import {
  openstackInstancesPull,
  openstackTenantsPull,
  openstackVolumesPull,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { ActionItem } from '@/resource/actions/ActionItem';

const apiMethods = {
  [INSTANCE_TYPE]: (uuid: string) => openstackInstancesPull({ path: { uuid } }),
  [VOLUME_TYPE]: (uuid: string) => openstackVolumesPull({ path: { uuid } }),
  [TENANT_TYPE]: (uuid: string) => openstackTenantsPull({ path: { uuid } }),
};

export const MultiPullAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch(): void;
}) => {
  const resources = useMemo(
    () =>
      rows.filter((resource) =>
        [INSTANCE_TYPE, VOLUME_TYPE, TENANT_TYPE].includes(
          resource.resource_type,
        ),
      ),
    [rows],
  );
  const validResources = useMemo(
    () =>
      resources.filter((resource) =>
        ['OK', 'ERRED'].includes(resource.backend_metadata.state),
      ),
    [resources],
  );

  const pullMutation = useBatchMutation({
    rows: validResources,
    mutationFn: (resource) =>
      apiMethods[resource.resource_type](resource.resource_uuid),
    successMessage: translate('Resources are synchronised.'),
    errorMessage: translate('Unable to synchronise resources.'),
    refetch,
    confirmation: {
      title: translate('Perform mass action'),
      body: translate(
        'Are you sure you want to synchronise {count} resources?',
        {
          count: validResources.length,
        },
      ),
    },
  });

  if (validResources.length === 0) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Synchronise')}
      action={() => pullMutation.mutate()}
      disabled={validResources.length !== rows.length || pullMutation.isPending}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
