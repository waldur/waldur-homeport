import { shallow } from 'enzyme';
import * as React from 'react';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { DialogBody } from './ZabbixHostDetailsDialog';

describe('ZabbixHostDetailsDialog', () => {
  describe('DialogBody', () => {
    const renderBody = (props?) =>
      shallow(<DialogBody translate={translate} {...props} />);

    it('renders spinner if data is still loading', () => {
      const wrapper = renderBody({ loading: true });
      expect(wrapper.find(LoadingSpinner).length).toBe(1);
    });

    it('renders error message if loading has failed', () => {
      const wrapper = renderBody({ erred: true });
      expect(wrapper.contains('Unable to load Zabbix host details.')).toBe(
        true,
      );
    });

    it('preselects chart tab if host is OK', () => {
      const wrapper = renderBody({ host: { state: 'OK' } });
      expect(wrapper.find(Tabs).prop('defaultActiveKey')).toBe(2);
    });

    it('selects details tab if host is not OK', () => {
      const wrapper = renderBody({ host: { state: 'Erred' } });
      expect(wrapper.find(Tabs).prop('defaultActiveKey')).toBe(1);
    });
  });
});
