import { FC } from 'react';
import { FormSpy } from 'react-final-form';

import { translate } from '@/i18n';
import {
  getOnlyOneProjectManagerTooltip,
  isInvitationRowProjectManagerBlocked,
  isOnlyOneProjectManagerEnabled,
  isProjectManagerRole,
} from '@/project/team/onlyOneProjectManager';
import { useProjectsActiveManagerMap } from '@/project/team/useProjectHasActiveManager';

import { GroupInviteRow, InvitationContext } from '../types';

import { FormButtons } from './FormButtons';
import { getFlaggedRows, getVerdictLists } from './rowFeedback';

interface InvitationCreateDialogFooterProps {
  resolve: InvitationContext;
  defaultProject?: { uuid?: string } | false | null;
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
  submitting: boolean;
  valid: boolean;
  isCheckingDuplicates?: boolean;
  onContinueClick?: (form: any) => Promise<boolean>;
  form?: any;
}

const getFallbackProjectUuid = (
  resolve: InvitationContext,
  defaultProject?: { uuid?: string } | false | null,
) =>
  resolve.project?.uuid ||
  (defaultProject && typeof defaultProject === 'object'
    ? defaultProject.uuid
    : undefined);

const InvitationCreateDialogFooterInner: FC<
  InvitationCreateDialogFooterProps & {
    rows: GroupInviteRow[];
    hasBlockingRows: boolean;
  }
> = ({
  resolve,
  defaultProject,
  rows,
  hasBlockingRows,
  step,
  setStep,
  submitting,
  valid,
  isCheckingDuplicates,
  onContinueClick,
  form,
}) => {
  const fallbackProjectUuid = getFallbackProjectUuid(resolve, defaultProject);
  const projectUuids = [
    fallbackProjectUuid,
    ...rows.map((row) => row?.role_project?.project?.uuid),
  ].filter(Boolean) as string[];

  const { managerMap, isLoading } = useProjectsActiveManagerMap(projectUuids);

  const hasProjectManagerInvite = rows.some(
    (row) =>
      isProjectManagerRole(row?.role_project?.role) &&
      Boolean(row?.role_project?.project?.uuid ?? fallbackProjectUuid),
  );

  const isProjectManagerBlocked = rows.some((row) =>
    isInvitationRowProjectManagerBlocked(row, managerMap, fallbackProjectUuid),
  );

  const isCheckingProjectManager =
    isOnlyOneProjectManagerEnabled() && hasProjectManagerInvite && isLoading;

  const actionDisabled = isProjectManagerBlocked || isCheckingProjectManager;

  const actionDisabledReason = actionDisabled
    ? getOnlyOneProjectManagerTooltip()
    : undefined;

  return (
    <FormButtons
      step={step}
      setStep={setStep}
      submitting={submitting}
      valid={valid}
      isCheckingDuplicates={isCheckingDuplicates}
      onContinueClick={onContinueClick}
      form={form}
      actionDisabledReason={actionDisabledReason}
      invalidReason={
        hasBlockingRows
          ? translate(
              'Some rows need attention. Fix the rows marked in red to continue.',
            )
          : translate('Fix the highlighted fields to continue.')
      }
    />
  );
};

export const InvitationCreateDialogFooter: FC<
  InvitationCreateDialogFooterProps
> = (props) => (
  <FormSpy subscription={{ values: true }}>
    {({ values }) => (
      <InvitationCreateDialogFooterInner
        {...props}
        rows={(values?.rows ?? []) as GroupInviteRow[]}
        hasBlockingRows={getFlaggedRows(
          values?.rows,
          getVerdictLists(values),
        ).some((row) => row.blocking)}
      />
    )}
  </FormSpy>
);
