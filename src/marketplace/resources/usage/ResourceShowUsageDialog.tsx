import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ResourceUsageTabsContainer } from '@/marketplace/resources/usage/ResourceUsageTabsContainer';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { getComponentsAndUsages } from './utils';

interface ResourceUsageDialogProps {
  resolve: {
    resource: Resource;
  };
}

export const ResourceShowUsageDialog: FunctionComponent<
  ResourceUsageDialogProps
> = ({ resolve }) => {
  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['ResourceShowUsageDialog', resolve],
    queryFn: () => getComponentsAndUsages(resolve.resource.uuid, null),
  });

  return (
    <ModalDialog
      title={translate('Resource usage for {resourceName}', {
        resourceName: resolve.resource.name,
      })}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>
          {translate('Unable to load data')}
          <br />
          {error.message}
        </>
      ) : !value.components.length ? (
        <h3>
          {translate('Offering does not have any usage-based components.')}
        </h3>
      ) : (
        <ResourceUsageTabsContainer
          resource={{
            resource_uuid: resolve.resource.uuid,
            ...resolve.resource,
          }}
          data={value}
        />
      )}
    </ModalDialog>
  );
};
