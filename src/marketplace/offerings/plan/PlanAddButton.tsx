import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface PlanAddButtonProps extends TranslateProps {
  onClick(): void;
}

export const PlanAddButton = withTranslation((props: PlanAddButtonProps) => (
  <button
    type="button"
    className="btn btn-default"
    onClick={props.onClick}>
    <i className="fa fa-plus"/>
    {' '}
    {props.translate('Add plan')}
  </button>
));
