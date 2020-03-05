import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface ComponentAddButtonProps extends TranslateProps {
  onClick(): void;
}

export const ComponentAddButton = withTranslation(
  (props: ComponentAddButtonProps) => (
    <button type="button" className="btn btn-default" onClick={props.onClick}>
      <i className="fa fa-plus" /> {props.translate('Add component')}
    </button>
  ),
);
