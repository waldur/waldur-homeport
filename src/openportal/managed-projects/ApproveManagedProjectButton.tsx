import { CheckCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { openportalManagedProjectsApprove } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const ApproveManagedProjectButton = ({
  row,
  as,
  className,
  refetch,
}) => {
  const project = row; // Assuming row is the project object

  const { mutate, isPending: isLoading } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openportalManagedProjectsApprove({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
      }),
    refetch,
    successMessage: translate('Project has been approved.'),
    errorMessage: translate('Unable to approve project.'),
  });

  if (!project) {
    return null;
  }

  const content = (
    <>
      {isLoading ? (
        <LoadingSpinnerSimple className="me-1" />
      ) : (
        <ActionItem
          as={as}
          className={classNames(className, 'w-100')}
          title={translate('Approve')}
          action={mutate}
          disabled={isLoading}
          iconNode={<CheckCircleIcon weight="bold" />}
          size="sm"
        />
      )}
    </>
  );

  return (
    <Tooltip label={translate('Click to approve this project.')}>
      <span>{content}</span>
    </Tooltip>
  );
};
