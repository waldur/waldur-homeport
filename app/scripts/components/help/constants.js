export const dashboardHelp = {
  alertsList: {
    type: 'alertsList',
    name: 'alerts',
    title: gettext('Alerts')
  },
  eventsList: {
    type: 'eventsList',
    name: 'events',
    title: gettext('Events')
  }
};

export const profileHelp = {
  sshKeys: {
    type: 'sshKeys',
    name: 'keys',
    title: gettext('How to generate SSH key')
  }
};

export const providersHelp = [
  {
    type: 'providers',
    key: 'Azure',
    name: 'Azure provider',
    link: null
  },
  {
    type: 'providers',
    key: 'Amazon',
    name: 'Amazon EC2 provider',
    link: 'http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html'
  },
  {
    type: 'providers',
    key: 'DigitalOcean',
    name: 'DigitalOcean provider',
    link: 'https://www.digitalocean.com/community/tutorials/how-to-use-the-digitalocean-api-v2'
  }
];
