import { data } from './api';
import {
  selectServiceProvider,
  selectServiceProviderConsumers,
  selectCountriesToRender,
  propertySelectorFactory,
} from './selectors';

const state = {
  serviceUsage: {
    data,
    selectedServiceProviderUuid: 'csc',
    loading: false,
    infoPanelIsVisible: false,
  },
};

describe('Selectors', () => {
  it('should return selected service provider', () => {
    const expected = {
      name: 'CSC - IT center for Science',
      country: 'Finland',
      latitude: '60.1781296',
      longitude: '24.830555',
      description: 'CSC is a Finnish center of expertise in ICT and HPC.',
      logo:
        'http://www.hermanit.fi/wp-content/uploads/2016/09/CSC_2012_LOGO_RGB_72dpi.jpg',
    };
    expect(selectServiceProvider(state)).toEqual(expected);
  });

  it('should return consumers for selected service provider', () => {
    const expected = [
      {
        name: 'University of Iceland',
        period: '03-2018',
        cpu: 100000,
        ram: 3000000,
        gpu: 20000,
      },
      {
        name: 'KTH Royal Institute of Technology',
        period: '03-2018',
        cpu: 100000,
        ram: 3000000,
        gpu: 20000,
      },
      {
        name: 'University of Tartu',
        period: '03-2018',
        cpu: 400000,
        ram: 3500000,
        gpu: 10000,
      },
    ];
    expect(selectServiceProviderConsumers(state)).toEqual(expected);
  });

  it('should return countries to render', () => {
    const expected = [
      'Estonia',
      'Iceland',
      'Finland',
      'Sweden',
      'Denmark',
      'Norway',
    ];
    expect(selectCountriesToRender(state)).toEqual(expected);
  });

  it('it should create selector factory that creates selector for accumulation of properties(name or country) among organizations', () => {
    const expected = [
      { name: 'Estonia' },
      { name: 'Iceland' },
      { name: 'Finland' },
      { name: 'Sweden' },
      { name: 'Denmark' },
      { name: 'Norway' },
    ];
    expect(propertySelectorFactory('country')(state)).toEqual(expected);
  });
});
