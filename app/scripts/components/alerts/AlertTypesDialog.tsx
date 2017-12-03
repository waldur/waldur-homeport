import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/table-react/utils';
import { TypeListDialog } from '@waldur/events/TypeListDialog';

import { getAvailableEventGroups } from './utils';

const PureAlertTypesDialog = ({ translate }: TranslateProps) => (
  <TypeListDialog
    types={getAvailableEventGroups()}
    dialogTitle={translate('Alert types')}
  />
);

const AlertTypesDialog = withTranslation(PureAlertTypesDialog);

export default connectAngularComponent(AlertTypesDialog);
