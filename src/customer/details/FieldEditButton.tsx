import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

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
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(
      props.name === 'project_metadata_checklist'
        ? EditCustomerChecklistDialog
        : EditFieldDialog,
      { resolve: props },
    );
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
