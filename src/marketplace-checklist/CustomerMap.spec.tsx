import { shallow } from 'enzyme';
import { Marker, Popup } from 'react-leaflet';

import { CustomerMap } from './CustomerMap';
import { initCustomer } from './fixtures';

jest.mock('@waldur/images/marker-icon-red.png', () => 'marker-icon-red.png');
jest.mock(
  '@waldur/images/marker-icon-yellow.png',
  () => 'marker-icon-yellow.png',
);
jest.mock(
  '@waldur/images/marker-icon-green.png',
  () => 'marker-icon-green.png',
);

const getSrcFromCustomerMap = (props = {}) => {
  const customers = [initCustomer(props)];

  const component = shallow(<CustomerMap customers={customers} />);
  const icon = component.find(Marker);
  const src = icon.prop('icon');

  return src.options.iconUrl;
};

describe('CustomerMap', () => {
  describe('Marker', () => {
    it('should render a red marker', () => {
      const src = getSrcFromCustomerMap();

      expect(src).toEqual('marker-icon-red.png');
    });

    it('should render a yellow marker', () => {
      const src = getSrcFromCustomerMap({ score: 50 });

      expect(src).toEqual('marker-icon-yellow.png');
    });

    it('should render a green marker', () => {
      const src = getSrcFromCustomerMap({ score: 80 });

      expect(src).toEqual('marker-icon-green.png');
    });

    it("should't render any markers", () => {
      const customers = [initCustomer({ latitude: null, longitude: null })];

      const component = shallow(<CustomerMap customers={customers} />);
      const icon = component.find(Marker);

      expect(icon).toHaveLength(0);
    });
  });

  describe('Popup', () => {
    it('should render a popup with name and score', () => {
      const customers = [initCustomer()];

      const component = shallow(<CustomerMap customers={customers} />);
      const popup = component.find(Popup);
      const icon = component.find(Marker);
      const text = popup.text();

      expect(icon).toHaveLength(1);
      expect(text).toBe('Alex: 0 %');
    });

    it("shouldn't render any popups", () => {
      const customers = [initCustomer({ latitude: null, longitude: null })];

      const component = shallow(<CustomerMap customers={customers} />);
      const popup = component.find(Popup);

      expect(popup).toHaveLength(0);
    });
  });
});
