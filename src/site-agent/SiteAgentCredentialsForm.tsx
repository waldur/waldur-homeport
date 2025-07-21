import { FunctionComponent } from 'react';

import { ENV } from '@waldur/core/config';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

export const SiteAgentCredentialsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => (
  <>
    <FormTable.Item
      label={translate('Waldur API URL')}
      value={
        <div className="d-flex align-items-center gap-2">
          {ENV.apiEndpoint}
          <CopyToClipboardButton value={ENV.apiEndpoint} />
        </div>
      }
    />

    <FormTable.Item
      label={translate('Offering UUID')}
      value={
        <div className="d-flex align-items-center gap-2">
          {props.offering.uuid}
          <CopyToClipboardButton value={props.offering.uuid} />
        </div>
      }
    />
  </>
);
