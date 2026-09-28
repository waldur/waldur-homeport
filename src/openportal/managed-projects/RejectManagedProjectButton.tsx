import { XCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { openportalManagedProjectsReject } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const RejectManagedProjectButton = ({ row, as, className, refetch }) => {
  const project = row; // Assuming row is the project object

  if (!project) {
    return null;
  }

  const rejectMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openportalManagedProjectsReject({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
      }),
    successMessage: translate('Project has been rejected.'),
    errorMessage: translate('Unable to reject project.'),
    refetch,
    confirmation: {
      title: translate('Reject managed project request'),
      body: translate(
        'Are you sure you want to reject this managed project request?',
      ),
    },
  });

  const content = (
    <>
      {rejectMutation.isPending ? (
        <LoadingSpinnerSimple className="me-1" />
      ) : (
        <ActionItem
          as={as}
          className={classNames(className, 'w-100')}
          title={translate('Reject')}
          action={() => rejectMutation.mutate()}
          disabled={rejectMutation.isPending}
          iconNode={<XCircleIcon weight="bold" />}
          size="sm"
        />
      )}
    </>
  );

  return (
    <Tooltip label={translate('Click to reject this project.')}>
      <span>{content}</span>
    </Tooltip>
  );
};
