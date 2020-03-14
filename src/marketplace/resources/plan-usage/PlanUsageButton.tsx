import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

import { PlanUsageRowProps } from './types';

interface DispatchProps {
  openDialog(): void;
}

type Props = DispatchProps & PlanUsageRowProps;

const PurePlanUsageButton = (props: Props) => (
  <ActionButton
    title={translate('Show chart')}
    disabled={props.row.limit === null}
    tooltip={
      props.row.limit === null ? translate('Plan does not have limit') : ''
    }
    action={props.openDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () =>
    dispatch(
      openModalDialog('marketplacePlanUsageDialog', {
        resolve: { row: ownProps.row },
      }),
    ),
});

const connector = connect(null, mapDispatchToProps);

export const PlanUsageButton = connector(
  PurePlanUsageButton,
) as React.ComponentType<PlanUsageRowProps>;
