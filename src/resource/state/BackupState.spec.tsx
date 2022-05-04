import { mount } from 'enzyme';

import { BackupState } from './BackupState';

describe('BackupState', () => {
  it('renders warning if backup is not set', () => {
    const wrapper = mount(<BackupState resource={{ backup_state: 'Unset' }} />);
    expect(wrapper.find('.bg-danger').length).toBe(1);
  });

  it('renders info class if backup is okay', () => {
    const wrapper = mount(<BackupState resource={{ backup_state: 'OK' }} />);
    expect(wrapper.find('.bg-info').length).toBe(1);
  });

  it('renders plain class if backup is not supported', () => {
    const wrapper = mount(
      <BackupState resource={{ backup_state: 'Unsupported' }} />,
    );
    expect(wrapper.find('.bg-plain').length).toBe(1);
  });
});
