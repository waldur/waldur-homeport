import * as React from 'react';
import { connect } from 'react-redux';

import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';
import { getWorkspace } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

interface BackButtonProps {
  goBack(): void;
}

const PureBackButton = (props: BackButtonProps) => (
  <ActionButton
    title={translate('Back to shopping')}
    icon="fa fa-arrow-left"
    className="btn btn-outline btn-default"
    action={props.goBack}
  />
);

const connector = connect((state: OuterState) => {
  const goBack = () => {
    const workspace = getWorkspace(state);
    if (workspace === 'organization') {
      $state.go('marketplace-landing-customer');
    } else {
      $state.go('marketplace-landing');
    }
  };
  return {goBack};
});

export const BackButton = connector(PureBackButton);
