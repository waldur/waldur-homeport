import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { CallResourceTemplate } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';

const ResourceTemplateFormDialog = lazyComponent(() =>
  import('./ResourceTemplateFormDialog').then((module) => ({
    default: module.ResourceTemplateFormDialog,
  })),
);

interface OwnProps {
  call: Call;
  row: CallResourceTemplate;
  refetch(): void;
}

export const ResourceTemplateEditButton = ({
  row,
  refetch,
  call,
}: OwnProps) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(ResourceTemplateFormDialog, {
          resolve: { call, refetch, uuid: row.uuid },
          initialValues: {
            name: row.name,
            offering: {
              uuid: row.requested_offering_uuid,
              url: row.requested_offering,
              offering_name: row.requested_offering_name,
            },
            description: row.description,
            attributes: row.attributes,
            limits: row.limits,
          },
          size: 'lg',
          formId: 'CallResourceTemplateForm',
        }),
      ),
    [dispatch, row, refetch],
  );

  return <EditAction action={callback} />;
};
