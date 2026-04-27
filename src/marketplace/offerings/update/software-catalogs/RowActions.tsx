import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { DeleteSoftwareCatalogButton } from './DeleteSoftwareCatalogButton';
import { EditSoftwareCatalogButton } from './EditSoftwareCatalogButton';

const RowActions = ({ row, refetch, offering }) => {
  return (
    <ActionsDropdownComponent>
      <EditSoftwareCatalogButton
        offering={offering}
        softwareCatalog={row}
        refetch={refetch}
      />
      <DeleteSoftwareCatalogButton
        offering={offering}
        softwareCatalog={row}
        refetch={refetch}
      />
    </ActionsDropdownComponent>
  );
};

export { RowActions };
