import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { ExpandableEventDetailsTable } from './ExpandableEventDetailsTable';
import { Event } from './types';

interface StateProps {
  isStaffOrSupport: boolean;
}

interface ExpandableEventDetailsProps extends StateProps {
  row: Event;
}

const PureExpandableEventDetails: FunctionComponent<ExpandableEventDetailsProps> =
  (props) => (
    <ExpandableEventDetailsTable
      event={props.row}
      isStaffOrSupport={props.isStaffOrSupport}
    />
  );

const mapStateToProps = (state: RootState) => ({
  isStaffOrSupport: isStaffOrSupport(state),
});

const enhance = connect<StateProps>(mapStateToProps);

export const ExpandableEventDetails = enhance(PureExpandableEventDetails);
