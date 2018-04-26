import * as React from 'react';

import { TypeListDialog } from '@waldur/events/TypeListDialog';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import * as eventRegistry from './registry';

const PureAlertTypesDialog = ({ translate }: TranslateProps) => (
  <TypeListDialog
    types={eventRegistry.get()}
    dialogTitle={translate('Alert types')}
  />
);

const AlertTypesDialog = withTranslation(PureAlertTypesDialog);

export default connectAngularComponent(AlertTypesDialog);
