import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { TypeListDialog } from './TypeListDialog';
import { getAvailableEventGroups } from './utils';

const PureEventTypesDialog = ({ translate }: TranslateProps) => (
  <TypeListDialog
    types={getAvailableEventGroups()}
    dialogTitle={translate('Event types')}
  />
);

const EventTypesDialog = withTranslation(PureEventTypesDialog);

export default connectAngularComponent(EventTypesDialog);
