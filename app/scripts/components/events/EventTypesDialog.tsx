import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import * as eventRegistry from './registry';
import { TypeListDialog } from './TypeListDialog';

const PureEventTypesDialog = ({ translate }: TranslateProps) => (
  <TypeListDialog
    types={eventRegistry.get()}
    dialogTitle={translate('Event types')}
  />
);

const EventTypesDialog = withTranslation(PureEventTypesDialog);

export default connectAngularComponent(EventTypesDialog);
