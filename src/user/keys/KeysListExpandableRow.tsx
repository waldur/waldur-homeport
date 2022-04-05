import { FunctionComponent } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';

export const KeysListExpandableRow: FunctionComponent<any> = ({ row }) =>
  row.public_key ? (
    <div className="container-fluid m-t">
      <p>
        <b className="me-2">{translate('Public key')}:</b>
        <CopyToClipboardContainer
          value={row.public_key}
          label={row.public_key}
        />
      </p>
    </div>
  ) : null;
