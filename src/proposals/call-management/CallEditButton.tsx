import { PencilSimple } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n/translate';

export const CallEditButton = ({ row }) => (
  <Link
    state="protected-call.main"
    params={{ call_uuid: row.uuid }}
    className="btn btn-light"
  >
    <span className="svg-icon svg-icon-2">
      <PencilSimple />
    </span>{' '}
    {translate('Edit')}
  </Link>
);
