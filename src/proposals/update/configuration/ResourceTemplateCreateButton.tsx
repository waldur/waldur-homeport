import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';

const ResourceTemplateFormDialog = lazyComponent(() =>
  import('./ResourceTemplateFormDialog').then((module) => ({
    default: module.ResourceTemplateFormDialog,
  })),
);

interface OwnProps {
  call: Call;
  refetch(): void;
}

export const ResourceTemplateCreateButton = ({ call, refetch }: OwnProps) => {
  const dispatch = useDispatch();
  const openCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ResourceTemplateFormDialog, {
          resolve: { call, refetch },
          size: 'lg',
          formId: 'CallResourceTemplateForm',
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openCreateDialog} />;
};
