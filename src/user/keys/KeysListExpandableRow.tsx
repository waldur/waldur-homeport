import { FunctionComponent } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';

export const KeysListExpandableRow: FunctionComponent<any> = ({ row }) =>
  row.public_key ? (
    <div className="container-fluid m-t">
      <p>
        <b className="me-2">{translate('Public key')}:</b>
        <CopyToClipboardContainer value={row.public_key} />
      </p>
      <p>
        <b className="me-2">{translate('Fingerprint (SHA512)')}:</b>
        <CopyToClipboardContainer value={row.fingerprint_sha512} />
      </p>
      <p>
        <b className="me-2">{translate('Fingerprint (MD5)')}:</b>
        <CopyToClipboardContainer value={row.fingerprint_md5} />
      </p>
    </div>
  ) : null;
