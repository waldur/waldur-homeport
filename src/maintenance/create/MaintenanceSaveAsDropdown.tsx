import { FilePlusIcon, FloppyDiskBackIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ServiceProvider } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { MaintenanceForm, MaintenanceFormDialogProps } from '../types';

interface OwnProps {
  formComponent: FC<MaintenanceFormDialogProps>;
  formValues: MaintenanceForm;
  provider?: ServiceProvider;
  maintenanceUuid?: string;
  refetch?(): void;
}

const MaintenanceSaveAsTemplateDialog = lazyComponent(() =>
  import('./MaintenanceSaveAsTemplateDialog').then((module) => ({
    default: module.MaintenanceSaveAsTemplateDialog,
  })),
);

export const MaintenanceSaveAsDropdown: FC<OwnProps> = ({
  formComponent,
  formValues,
  provider,
  maintenanceUuid,
  refetch,
}) => {
  const { openDialog } = useModal();

  return (
    <ActionsMenu
      toggle="labeled"
      label={
        <>
          <span className="svg-icon svg-icon-2">
            <FloppyDiskBackIcon weight="bold" />
          </span>
          {translate('Save as')}
        </>
      }
      toggleClassName="min-w-125px"
      className="min-w-150px"
      side="bottom"
    >
      <ActionItem
        title={translate('Template')}
        action={() =>
          openDialog(MaintenanceSaveAsTemplateDialog, {
            resolve: {
              formComponent,
              refetch,
              data: formValues,
              maintenanceUuid,
              provider,
            },
            backdrop: 'static',
          })
        }
        iconNode={<FilePlusIcon weight="bold" />}
      />
    </ActionsMenu>
  );
};
