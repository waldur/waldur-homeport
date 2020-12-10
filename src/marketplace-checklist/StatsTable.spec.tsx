import { shallow } from 'enzyme';
import { Table } from 'react-bootstrap';

import { StateIndicator } from '@waldur/core/StateIndicator';

import { initCustomer } from './fixtures';
import { StatsTable } from './StatsTable';

const setupTable = (props = {}) => {
  const customers = [initCustomer(props)];
  const component = shallow(
    <StatsTable stats={customers} scopeTitle="Organization" />,
  );

  return component;
};

const getVariantFormStatsTable = (props = {}) => {
  const component = setupTable(props);
  const indicator = component.find(StateIndicator);
  const variant = indicator.prop('variant');

  return variant;
};

describe('StatsTable', () => {
  it('should have table structure', () => {
    const component = setupTable();
    const table = component.find(Table);
    const thead = component.find('thead');
    const tbody = component.find('tbody');
    const trs = component.find('tr');

    expect(table).toHaveLength(1);
    expect(thead).toHaveLength(1);
    expect(tbody).toHaveLength(1);
    expect(trs).toBeTruthy();
  });

  it('should render th titles', () => {
    const component = setupTable();
    const ths = component.find('th');
    const thLabels = ['#', 'Organization', 'Score'];

    ths.forEach((th, i) => {
      expect(th.text()).toBe(thLabels[i]);
    });
  });

  it('should render index label', () => {
    const component = setupTable();
    const index = component.find('td').at(0).text();

    expect(index).toBe('1');
  });

  it('should render name label', () => {
    const component = setupTable();
    const name = component.find('td').at(1).text();

    expect(name).toBe('Alex');
  });
  describe('score label', () => {
    it('should render danger score label', () => {
      const variant = getVariantFormStatsTable();

      expect(variant).toBe('danger');
    });

    it('should render warning score label', () => {
      const variant = getVariantFormStatsTable({ score: 50 });

      expect(variant).toBe('warning');
    });

    it('should render primary score label', () => {
      const variant = getVariantFormStatsTable({ score: 80 });

      expect(variant).toBe('primary');
    });
  });
});
