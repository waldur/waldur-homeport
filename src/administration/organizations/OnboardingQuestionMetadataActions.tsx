import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  onboardingQuestionMetadataDestroy,
  OnboardingQuestionMetadata,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

interface OnboardingQuestionMetadataActionsProps {
  row: OnboardingQuestionMetadata;
  fetch: () => void;
}

const OnboardingQuestionMappingFormDialog = lazyComponent(() =>
  import('@waldur/administration/organizations/OnboardingQuestionMappingFormDialog').then(
    (module) => ({
      default: module.OnboardingQuestionMappingFormDialog,
    }),
  ),
);

export const OnboardingQuestionMetadataActions: FC<
  OnboardingQuestionMetadataActionsProps
> = ({ row, fetch: refetch }) => {
  const dispatch = useDispatch();

  const editMapping = () => {
    dispatch(
      openModalDialog(OnboardingQuestionMappingFormDialog, {
        resolve: { mapping: row, refetch },
        size: 'lg',
      }),
    );
  };

  const deleteMapping = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the mapping for question "{question}"?',
          { question: row.question_description },
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await onboardingQuestionMetadataDestroy({
        path: { uuid: row.uuid },
      });
      dispatch(showSuccess(translate('Question mapping has been deleted.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to delete question mapping.'),
        ),
      );
    }
  };

  const OnboardingQuestionMetadataEditAction = () => (
    <EditAction action={editMapping} />
  );

  const OnboardingQuestionMetadataDeleteAction = () => (
    <ActionItem
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      action={deleteMapping}
    />
  );

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        OnboardingQuestionMetadataEditAction,
        OnboardingQuestionMetadataDeleteAction,
      ]}
    />
  );
};
