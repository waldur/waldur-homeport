import * as React from 'react';
import { react2angular } from 'react2angular';

import { TypeListDialog } from '@waldur/events/TypeListDialog';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import { getAvailableEventGroups } from './utils';
import { withStore } from '@waldur/table-react/utils';

type Props = TranslateProps & {
  dismiss(): void;
};

const AlertTypesDialog = withTranslation((props: Props) => {
  return (
    <TypeListDialog
      translate={props.translate}
      types={getAvailableEventGroups()}
      dismiss={props.dismiss}
      dialogTitle={props.translate('Alert types')}
    />
  );
});

export {
  AlertTypesDialog
};

export default react2angular(withStore(AlertTypesDialog), ['dismiss']);
