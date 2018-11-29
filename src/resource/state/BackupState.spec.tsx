import { render } from 'enzyme';
import * as React from 'react';

import { BackupState } from './BackupState';

describe('BackupState', () => {
  it('renders warning if backup is not set', () => {
    const wrapper = render(<BackupState resource={{backup_state: 'Unset'}}/>);
    expect(wrapper.find('.progress-bar-danger').length).toBe(1);
  });

  it('renders info class if backup is okay', () => {
    const wrapper = render(<BackupState resource={{backup_state: 'OK'}}/>);
    expect(wrapper.find('.progress-bar-info').length).toBe(1);
  });

  it('renders plain class if backup is not supported', () => {
    const wrapper = render(<BackupState resource={{backup_state: 'Unsupported'}}/>);
    expect(wrapper.find('.progress-bar-plain').length).toBe(1);
  });
});
