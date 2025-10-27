import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const SoftwareCatalogDialog = lazyComponent(() =>
  import('./SoftwareCatalogDialog').then((module) => ({
    default: module.SoftwareCatalogDialog,
  })),
);

export const EditSoftwareCatalogButton: FunctionComponent<{
  offering;
  softwareCatalog;
  refetch;
}> = ({ offering, softwareCatalog, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(SoftwareCatalogDialog, {
        resolve: { mode: 'edit', offering, softwareCatalog, refetch },
      }),
    );
  };
  return <EditAction action={callback} />;
};
