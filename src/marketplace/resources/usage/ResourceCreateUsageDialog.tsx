import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { getProviderUsageComponents } from './api';
import { ResourceUsageFormContainer } from './ResourceUsageFormContainer';
import { ResourceUsageSubmitButton } from './ResourceUsageSubmitButton';
import { UsageReportContext } from './types';

interface ResourceCreateUsageDialogProps {
  resolve: UsageReportContext;
}

export const ResourceCreateUsageDialog: FunctionComponent<
  ResourceCreateUsageDialogProps
> = (props) => {
  const isUserUsage = props.resolve.userUsage;

  const { loading, error, value } = useAsync(
    () => getProviderUsageComponents(props.resolve),
    [props.resolve],
  );

  return (
    <ModalDialog
      title={
        (isUserUsage
          ? translate('User usage report')
          : translate('Resource usage')) + ` "${props.resolve.resource_name}"`
      }
      bodyClassName="pt-2"
      footer={<ResourceUsageSubmitButton params={props.resolve} />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <h3>{translate('Unable to load offering details.')}</h3>
      ) : value.components.length === 0 ? (
        <h3>
          {translate('Offering does not have any usage-based components.')}
        </h3>
      ) : (
        <ResourceUsageFormContainer
          params={props.resolve}
          components={value.components}
          periods={value.periods}
        />
      )}
    </ModalDialog>
  );
};
