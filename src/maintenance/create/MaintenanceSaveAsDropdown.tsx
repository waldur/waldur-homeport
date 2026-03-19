import { FilePlusIcon, FloppyDiskBackIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  MaintenanceAnnouncementTemplate,
  ServiceProvider,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

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
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const onSave = useCallback(
    (template: MaintenanceAnnouncementTemplate) => {
      queryClient.setQueryData(
        ['MaintenanceTemplates', provider?.uuid],
        (cachedData: MaintenanceAnnouncementTemplate[] | undefined) => {
          const foundIndex = (cachedData || []).findIndex(
            (temp) => temp.uuid === template.uuid,
          );
          const newData = [...(cachedData || [])];

          if (foundIndex >= 0) {
            // Replace
            newData.splice(foundIndex, 1, template);
          } else {
            // Add new
            newData.unshift(template);
          }
          return newData;
        },
      );
    },
    [provider],
  );

  return (
    <ActionsDropdownComponent
      labeled
      label={
        <>
          <span className="svg-icon svg-icon-2">
            <FloppyDiskBackIcon weight="bold" />
          </span>
          {translate('Save as')}
        </>
      }
      className="min-w-125px"
      menuClassName="min-w-150px"
      drop="down"
    >
      <ActionItem
        title={translate('Template')}
        action={() =>
          dispatch(
            openModalDialog(MaintenanceSaveAsTemplateDialog, {
              resolve: {
                formComponent,
                onSave,
                refetch,
                data: formValues,
                maintenanceUuid,
                provider,
              },
              backdrop: 'static',
            }),
          )
        }
        iconNode={<FilePlusIcon weight="bold" />}
      />
    </ActionsDropdownComponent>
  );
};
