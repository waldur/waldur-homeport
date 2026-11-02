import { FunctionComponent } from 'react';
import type { SshKey } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const KeysListExpandableRow: FunctionComponent<{ row: SshKey }> = ({
  row,
}) =>
  row.public_key ? (
    <ExpandableContainer>
      {/* The key and its fingerprints are long, so each row shows what fits
          and hands the whole value to the clipboard. */}
      <PropertyList variant="summary" valueClass="ellipsis">
        <PropertyItem
          label={translate('Public key')}
          value={row.public_key}
          hasCopy
        />
        <PropertyItem
          label={translate('Fingerprint (SHA512)')}
          value={row.fingerprint_sha512}
          hasCopy
        />
        <PropertyItem
          label={translate('Fingerprint (MD5)')}
          value={row.fingerprint_md5}
          hasCopy
        />
      </PropertyList>
    </ExpandableContainer>
  ) : null;
