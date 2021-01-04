import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

import { UserEvents } from './UserEvents';

const mapsStateToProps = (state: RootState) => ({ user: getUser(state) });

export const CurrentUserEvents = connect(mapsStateToProps)(UserEvents);
