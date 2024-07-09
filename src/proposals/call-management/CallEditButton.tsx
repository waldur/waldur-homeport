import { PencilSimple } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n/translate';

export const CallEditButton = ({ row }) => (
  <Link
    state="protected-call.main"
    params={{ call_uuid: row.uuid }}
    className="btn btn-outline btn-outline-dark border-gray-400 btn-active-secondary btn-sm px-2"
  >
    <span className="svg-icon svg-icon-2">
      <PencilSimple />
    </span>{' '}
    {translate('Edit')}
  </Link>
);
