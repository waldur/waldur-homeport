import { ActionsMenu } from '@/table/ActionsDropdown';

import { DeleteSoftwareCatalogButton } from './DeleteSoftwareCatalogButton';
import { EditSoftwareCatalogButton } from './EditSoftwareCatalogButton';

const RowActions = ({ row, refetch, offering }) => {
  return (
    <ActionsMenu>
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
    </ActionsMenu>
  );
};

export { RowActions };
