import { ChartBarIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { feedbackSurveysDestroy } from 'waldur-js-client';

import { CreateModalButton, EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

const FeedbackSurveyFormDialog = lazyComponent(() =>
  import('./FeedbackSurveyFormDialog').then((module) => ({
    default: module.FeedbackSurveyFormDialog,
  })),
);

export const FeedbackSurveyCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={FeedbackSurveyFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);

export const FeedbackSurveyEditButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={FeedbackSurveyFormDialog}
    row={row}
    buildResolve={(r) => ({ survey: r, refetch })}
    size="lg"
  />
);

export const FeedbackSurveyDeleteAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => feedbackSurveysDestroy({ path: { uuid: row.uuid } }),
    refetch,
    successMessage: translate('Survey has been deleted.'),
    errorMessage: translate('Unable to delete survey.'),
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the survey and all its answers?',
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};

export const FeedbackSurveyResultsAction = ({ row }) => {
  const router = useRouter();
  return (
    <ActionItem
      title={translate('View results')}
      iconNode={<ChartBarIcon weight="bold" />}
      action={() =>
        router.stateService.go('support-feedback-logs', {
          survey: JSON.stringify({ uuid: row.uuid, name: row.name }),
        })
      }
    />
  );
};
