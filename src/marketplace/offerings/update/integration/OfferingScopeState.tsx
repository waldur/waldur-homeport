import { Badge } from '@waldur/core/Badge';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

const variant = {
  OK: 'success',
  Erred: 'danger',
  Creating: 'warning',
  Updating: 'warning',
  Deleting: 'warning',
};

export const OfferingScopeState = ({ state }) => (
  <FormTable.Item
    label={translate('State')}
    value={
      <Badge pill variant={variant[state] || 'secondary'}>
        {state.toLocaleUpperCase()}
      </Badge>
    }
  />
);
