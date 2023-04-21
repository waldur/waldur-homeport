import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const ProviderActions = () => {
  return (
    <div>
      <Link state="#" className="btn btn-light">
        {translate('Manage')}
      </Link>
    </div>
  );
};
