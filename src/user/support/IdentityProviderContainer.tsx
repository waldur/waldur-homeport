import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { IdentityProviderIndicator } from './IdentityProviderIndicator';

export const IdentityProviderContainer = ({ user }) => (
  <FormTable.Card
    title={translate('Identity provider data')}
    className="card-bordered mb-7"
  >
    <FormTable>
      <FormTable.Item
        label={translate('Identity provider')}
        description={translate('Identity provider of the user')}
        value={<IdentityProviderIndicator user={user} />}
      />
    </FormTable>
  </FormTable.Card>
);
