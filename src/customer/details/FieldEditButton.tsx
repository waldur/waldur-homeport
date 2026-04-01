import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EditCustomerProps } from './types';

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

const EditCustomerChecklistDialog = lazyComponent(() =>
  import('./EditCustomerChecklistDialog').then((module) => ({
    default: module.EditCustomerChecklistDialog,
  })),
);

export const FieldEditButton = (props: EditCustomerProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(
        props.name === 'project_metadata_checklist'
          ? EditCustomerChecklistDialog
          : EditFieldDialog,
        { resolve: props },
      ),
    );
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
