import { FunctionComponent } from 'react';

import { translate } from '@/i18n';

import { PublicCallsList } from './PublicCallsList';

/** The calls with a round open for proposals now. */
export const OpenCallsPage: FunctionComponent = () => (
  <PublicCallsList
    offering_uuid={null}
    title={translate('Open calls')}
    hideTitle
    openOnly
  />
);
