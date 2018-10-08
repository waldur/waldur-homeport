import { UsageData } from './types';

export const data: UsageData = {
  organizations: {
    uni_of_tartu: {
      name: 'University of Tartu',
      country: 'Estonia',
      latitude: '58.378233',
      longitude: '26.7124485',
      description: 'University of Tartu is the 2nd oldest university in Swedish Empire.',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Tartu_%C3%9Clikool_logo.svg/1200px-Tartu_%C3%9Clikool_logo.svg.png',
    },
    csc: {
      name: 'CSC - IT center for Science',
      country: 'Finland',
      latitude: '60.1781296',
      longitude: '24.830555',
      description: 'CSC is a Finnish center of expertise in ICT and HPC.',
      logo: 'http://www.hermanit.fi/wp-content/uploads/2016/09/CSC_2012_LOGO_RGB_72dpi.jpg',
    },
    kth: {
      name: 'KTH Royal Institute of Technology',
      country: 'Sweden',
      latitude: '59.3498092',
      longitude: '18.0684706',
      description: 'KTH Royal Institute of Technology in Stockholm is Europe’s leading ' +
      'technical and engineering universities.',
      logo: 'https://www.kth.se/polopoly_fs/1.77259!/KTH_Logotyp_RGB_2013-2.svg',
    },
    hi: {
      name: 'University of Iceland',
      country: 'Iceland',
      latitude: '64.1396203',
      longitude: '-21.9869085',
      description: 'The University of Iceland is a progressive educational and scientific institution.',
      logo: 'https://pbs.twimg.com/profile_images/504625818123780096/wQRvkgpC_400x400.jpeg',
    },
    tampere: {
      name: 'University of Tampere',
      country: 'Finland',
      latitude: '61.4717588',
      longitude: '23.7836417',
      description: 'The University of Tampere (UTA) is a higher education institution with the ' +
      'social mission of educating visionaries who understand the world.',
      logo: 'http://www.uta.fi/sites/default/files/inline-images/logo_eng_small.jpg',
    },
    uiono: {
      name: 'University of Oslo',
      country: 'Norway',
      latitude: '59.9275799',
      longitude: '10.710839',
      description: 'University of Oslo is one of the best universities in Scandinavia.',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/31/University_of_Oslo_seal.svg/300px-University_of_Oslo_seal.svg.png',
    },
    sdudk: {
      name: 'University of Southern Denmark',
      country: 'Denmark',
      latitude: '55.4286029',
      longitude: '9.6752609',
      description: 'University of Southern Denmark is one of the best universities in Scandinavia.',
      logo: 'https://2.bp.blogspot.com/-oIcNjSOAjoI/Vkojfh8s0PI/AAAAAAAAAz0/8cMLZkRZvqY/s1600/University-of-Southern-Denmark-new-scholarships.png',
    },
    suse: {
      name: 'Stockholm University',
      country: 'Sweden',
      latitude: '59.3327147',
      longitude: '17.9770423',
      description: 'Stockholm University is one of the best universities in Scandinavia.',
      logo: 'https://www.su.se/img/logo_su_en_big_dark_blue.gif',
     },
    chalmers: {
      name: 'Chalmers University of Technology',
      country: 'Sweden',
      latitude: '57.6888144',
      longitude: '11.9759345',
      description: 'Chalmers University of Technology is one of the best universities in Scandinavia.',
      logo: 'https://www.chalmers.se/SiteCollectionImages/Logotyper/Chalmers%20logotyp/ChalmersU_black.png',
     },
    bergen: {
      name: 'University of Bergen',
      country: 'Norway',
      latitude: '60.3878586',
      longitude: '5.3217549',
      description: 'The University of Bergen is a public university located in Bergen, Norway.',
      logo: 'https://en.wikipedia.org/wiki/University_of_Bergen#/media/File:Uni-Bergen-emblem.png',
     },
  },
  service_providers: {
    uni_of_tartu: ['hi', 'tampere'],
    csc: ['hi', 'kth', 'uni_of_tartu'],
    sdudk: ['suse', 'chalmers'],
    uiono: ['tampere', 'hi', 'sdudk'],
    bergen: ['uni_of_tartu', 'kth'],
  },
  usage: [
    {
      provider_to_consumer: {
        provider_uuid: 'sdudk',
        consumer_uuid: 'suse',
      },
      data: {
        period: '03-2018',
        cpu: 300000,
        ram: 2000000,
        gpu: 10000,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'sdudk',
        consumer_uuid: 'chalmers',
      },
      data: {
        period: '03-2018',
        cpu: 450000,
        ram: 5000000,
        gpu: 0,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'uiono',
        consumer_uuid: 'tampere',
      },
      data: {
        period: '03-2018',
        cpu: 10000,
        ram: 500000,
        gpu: 0,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'uiono',
        consumer_uuid: 'hi',
      },
      data: {
        period: '03-2018',
        cpu: 30000,
        ram: 800000,
        gpu: 0,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'uiono',
        consumer_uuid: 'sdudk',
      },
      data: {
        period: '03-2018',
        cpu: 120000,
        ram: 70000,
        gpu: 0,
      },
    },
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
    {
      provider_to_consumer: {
        provider_uuid: 'csc',
        consumer_uuid: 'uni_of_tartu',
      },
      data: {
        period: '03-2018',
        cpu: 400000,
        ram: 3500000,
        gpu: 10000,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'bergen',
        consumer_uuid: 'uni_of_tartu',
      },
      data: {
        period: '03-2018',
        cpu: 400000,
        ram: 100000,
        gpu: 30000,
      },
    },
    {
      provider_to_consumer: {
        provider_uuid: 'bergen',
        consumer_uuid: 'kth',
      },
      data: {
        period: '03-2018',
        cpu: 800000,
        ram: 200000,
        gpu: 30000,
      },
    },
  ],
};

export const loadServiceProviders = () => data;
