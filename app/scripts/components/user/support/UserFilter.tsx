import * as React from 'react';

import Panel from '@waldur/core/Panel';
import { TranslateProps } from '@waldur/i18n';
import { withTranslation } from '@waldur/i18n/translate';

import { UserFilterContainer } from './UserFilterContainer';

const PureUserFilter = ({translate}: TranslateProps) => (
  <Panel title={translate('Apply filters')}>
    <UserFilterContainer />
  </Panel>
);

export const UserFilter = withTranslation(PureUserFilter);
