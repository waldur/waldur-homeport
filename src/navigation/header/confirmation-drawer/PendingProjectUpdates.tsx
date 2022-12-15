import { translate } from '@waldur/i18n';
import {
  TableComponent,
  TableOptions,
} from '@waldur/marketplace-remote/OrganizationProjectUpdateRequestsList';
import { connectTable } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

const PurePendingProjectUpdates: React.FC = (props) => (
  <div>
    <TableComponent
      title={translate('Project updates')}
      initialPageSize={5}
      fullWidth
      {...props}
    />
  </div>
);

const Options: TableOptionsType = {
  ...TableOptions,
  mapPropsToFilter: () => ({
    state: 'pending',
  }),
};

export const PendingProjectUpdates = connectTable(Options)(
  PurePendingProjectUpdates,
);
