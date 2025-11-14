import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  onboardingCountryConfigsDestroy,
  OnboardingCountryChecklistConfiguration,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

interface OnboardingCountryConfigActionsProps {
  row: OnboardingCountryChecklistConfiguration;
  fetch: () => void;
}

const OnboardingCountryConfigFormDialog = lazyComponent(() =>
  import(
    '@waldur/administration/organizations/OnboardingCountryConfigFormDialog'
  ).then((module) => ({
    default: module.OnboardingCountryConfigFormDialog,
  })),
);

export const OnboardingCountryConfigActions: FC<
  OnboardingCountryConfigActionsProps
> = ({ row, fetch: refetch }) => {
  const dispatch = useDispatch();

  const editConfig = () => {
    dispatch(
      openModalDialog(OnboardingCountryConfigFormDialog, {
        resolve: { config: row, refetch },
        size: 'lg',
      }),
    );
  };

  const deleteConfig = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the configuration for country "{country}"?',
          { country: row.country },
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await onboardingCountryConfigsDestroy({
        path: { uuid: row.uuid },
      });
      dispatch(
        showSuccess(translate('Country configuration has been deleted.')),
      );
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to delete country configuration.'),
        ),
      );
    }
  };

  const OnboardingCountryConfigEditAction = () => (
    <EditAction action={editConfig} />
  );

  const OnboardingCountryConfigDeleteAction = () => (
    <ActionItem
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      action={deleteConfig}
    />
  );

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        OnboardingCountryConfigEditAction,
        OnboardingCountryConfigDeleteAction,
      ]}
    />
  );
};
