import { connect } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { UserEvents } from './UserEvents';

const mapsStateToProps = state => ({ user: getUser(state) });

export const CurrentUserEvents = connect(mapsStateToProps)(UserEvents);
