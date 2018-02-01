import * as React from 'react';

import Panel from '@waldur/core/Panel';
import { TranslateProps } from '@waldur/i18n';
import { withTranslation } from '@waldur/i18n/translate';

import { UserFilterContainer } from './UserFilterContainer';

const PureUserFilter = (props: TranslateProps) => {
  return (
    <div className="filter-view">
      <Panel title={props.translate('Apply filters')}>
        <UserFilterContainer />
      </Panel>
    </div>
  );
};

export const UserFilter = withTranslation(PureUserFilter);
