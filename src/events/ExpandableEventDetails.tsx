import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { type RootState } from '@/store/reducers';
import { isStaffOrSupport } from '@/workspace/selectors';

import { ExpandableEventDetailsTable } from './ExpandableEventDetailsTable';
import { Event } from './types';

type StateProps = ReturnType<typeof mapStateToProps>;

interface ExpandableEventDetailsProps extends StateProps {
  row: Event;
}

const PureExpandableEventDetails: FunctionComponent<
  ExpandableEventDetailsProps
> = (props) => (
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
