import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface EnvironmentVariableAddButtonProps extends TranslateProps {
  onClick(): void;
}

export const EnvironmentVariableAddButton = withTranslation(
  (props: EnvironmentVariableAddButtonProps) => (
    <button type="button" className="btn btn-default" onClick={props.onClick}>
      <i className="fa fa-plus" /> {props.translate('Add environment variable')}
    </button>
  ),
);
