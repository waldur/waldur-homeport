import { FileXIcon } from '@phosphor-icons/react';
import { ReactElement, ReactNode } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { formatResourceType } from '../utils';

import { ActionItem } from './ActionItem';
import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface DestroyActionItemProps<T> {
  apiMethod(id: string): Promise<any>;
  resource: T;
  dialogSubtitle?: ReactNode;
  validators?: ActionValidator<T>[];
  refetch?(): void;
}

const getConfirmationText = (resource) => {
  const context = {
    name: resource.name.toUpperCase(),
    resourceType: formatResourceType(resource) || 'resource',
  };
  if (resource.state === 'ERRED') {
    return translate(
      'Are you sure you want to delete a {name} {resourceType} in an Erred state? A cleanup attempt will be performed if you choose so. ',
      context,
    );
  } else {
    return translate(
      'Are you sure you want to delete a {name} {resourceType}? ',
      context,
    );
  }
};

export const DestroyActionItem: <T extends { uuid?: string }>(
  props: DestroyActionItemProps<T>,
) => ReactElement = ({
  resource,
  apiMethod,
  validators,
  dialogSubtitle,
  refetch,
}) => {
  const validationState = useValidators(validators, resource);

  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => apiMethod(resource.uuid),
    successMessage: translate('Resource deletion has been scheduled.'),
    errorMessage: translate('Unable to delete resource.'),
    refetch,
    confirmation: {
      title: translate('Destroy resource'),
      body: (
        <>
          {getConfirmationText(resource)}
          {dialogSubtitle}
        </>
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Destroy')}
      action={() => deleteMutation.mutate()}
      className="text-danger"
      iconNode={<FileXIcon weight="bold" />}
      iconColor="danger"
      {...validationState}
      disabled={deleteMutation.isPending || validationState.disabled}
    />
  );
};
