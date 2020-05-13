import { mount } from 'enzyme';
import * as React from 'react';

import { NodeRoleField } from './NodeRoleField';

describe('NodeRoleField', () => {
  it('renders single role', () => {
    expect(
      mount(<NodeRoleField node={{ worker_role: true }} />).text(),
    ).toEqual('worker');
  });

  it('renders comma separated list of roles', () => {
    expect(
      mount(
        <NodeRoleField node={{ worker_role: true, etcd_role: true }} />,
      ).text(),
    ).toEqual('worker, etcd');
  });

  it('renders all roles', () => {
    expect(
      mount(
        <NodeRoleField
          node={{ worker_role: true, etcd_role: true, controlplane_role: true }}
        />,
      ).text(),
    ).toEqual('All');
  });
});
