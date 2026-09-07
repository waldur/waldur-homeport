import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { getProviderUsageComponents } from './api';
import { ResourceUsageFormContainer } from './ResourceUsageFormContainer';
import { UsageReportContext } from './types';

interface ResourceCreateUsageDialogProps {
  resolve: UsageReportContext;
}

export const ResourceCreateUsageDialog: FunctionComponent<
  ResourceCreateUsageDialogProps
> = (props) => {
  const isUserUsage = props.resolve.userUsage;
  const title =
    (isUserUsage
      ? translate('User usage report')
      : translate('Resource usage')) + ` "${props.resolve.resource_name}"`;

  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['ResourceCreateUsageDialog', props.resolve],
    queryFn: () => getProviderUsageComponents(props.resolve),
  });

  if (loading) {
    return (
      <ModalDialog title={title}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  if (error) {
    return (
      <ModalDialog title={title}>
        <h3>{translate('Unable to load offering details.')}</h3>
      </ModalDialog>
    );
  }

  if (value.components.length === 0) {
    return (
      <ModalDialog title={title}>
        <h3>
          {translate('Offering does not have any usage-based components.')}
        </h3>
      </ModalDialog>
    );
  }

  // The submit button lives in ModalDialog's own `footer` prop (a real
  // sibling of .modal-body inside .modal-content, not nested inside it),
  // so the <form> has to wrap the whole ModalDialog rather than sit inside
  // it -- see ResourceUsageFormContainer, which owns that <Form>.
  return (
    <ResourceUsageFormContainer
      title={title}
      params={props.resolve}
      components={value.components}
      periods={value.periods}
    />
  );
};
