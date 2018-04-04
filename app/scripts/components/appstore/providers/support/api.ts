// import { $http, $state, $rootScope, ENV } from '@waldur/core/services';

const data = {
  organizations: {
    uni_of_tartu: {
      uuid: '56125b12j',
      name: 'University of Tartu',
      country: 'Estonia',
      latitude: '58.378233',
      longitude: '26.7124485',
      description: 'University of Tartu is the 2nd oldest university in Swedish Empire.',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Tartu_%C3%9Clikool_logo.svg/1200px-Tartu_%C3%9Clikool_logo.svg.png',
      consumers: ['hi', 'tampere'],
    },
    csc: {
      uuid: '9b12hb12l',
      name: 'CSC - IT center for Science',
      country: 'Finland',
      latitude: '60.1781296',
      longitude: '24.830555',
      description: 'CSC is a Finnish center of expertise in ICT that provides ICT expert services at an ' +
      'internationally high level of quality for research, education, culture, public administration and enterprises, ' +
      'to help them thrive and benefit society at large.',
      logo: 'http://www.hermanit.fi/wp-content/uploads/2016/09/CSC_2012_LOGO_RGB_72dpi.jpg',
    },
    kth: {
      name: 'KTH Royal Institute of Technology',
      country: 'Sweden',
      latitude: '59.3498092',
      longitude: '18.0684706',
      description: 'KTH Royal Institute of Technology in Stockholm has grown to become one of Europe’s leading ' +
      'technical and engineering universities, as well as a key centre of intellectual talent and innovation.',
      logo: 'https://www.kth.se/polopoly_fs/1.77259!/KTH_Logotyp_RGB_2013-2.svg',
    },
    hi: {
      name: 'University of Iceland',
      country: 'Iceland',
      latitude: '64.1396203',
      longitude: '-21.9869085',
      description: 'The University of Iceland is a progressive educational and scientific institution, renowned in the global scientific community for its research. ' +
      'It is a state university, situated in the heart of Reykjavík, the capital of Iceland.',
      logo: 'https://pbs.twimg.com/profile_images/504625818123780096/wQRvkgpC_400x400.jpeg',
    },
    tampere: {
      name: 'University of Tampere',
      country: 'Finland',
      latitude: '61.4717588',
      longitude: '23.7836417',
      description: 'The University of Tampere (UTA) is a culturally-committed higher education institution with the ' +
      'social mission of educating visionaries who understand the world and change it.',
      logo: 'http://www.uta.fi/sites/default/files/inline-images/logo_eng_small.jpg',
    },
  },
  service_providers: {
    uni_of_tartu: ['hi', 'tampere'],
    csc: ['hi', 'kth'],
  },
  usage: [
    {
      provider_to_consumer: {
        provider_uuid: 'uni_of_tartu',
        consumer_uuid: 'hi',
      },
      data: {
        period: '03-2018',
        cpu: 100000,
        ram: 3000000,
        gpu: 20000,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'uni_of_tartu',
        consumer_uuid: 'tampere',
      },
      data: {
        period: '03-2018',
        cpu: 100000,
        ram: 3000000,
        gpu: 20000,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'csc',
        consumer_uuid: 'hi',
      },
      data: {
        period: '03-2018',
        cpu: 100000,
        ram: 3000000,
        gpu: 20000,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'csc',
        consumer_uuid: 'kth',
      },
      data: {
        period: '03-2018',
        cpu: 100000,
        ram: 3000000,
        gpu: 20000,
      },
    },
  ],
};

export const loadServiceProviders = () => data;
