import { Provider } from '../../types';

// tslint:disable
const MSIcon = require('./microsoft.png');

export const providers: Provider[] = [
  {
    name: 'Microsoft',
    email: 'microsoft@gmail.com',
    logo: MSIcon,
    registration_code: '123m12k3n',
    description: `Microsoft Corporation develops, licenses,
                  and supports software products and services;
                  and designs and sells hardware worldwide.
                  Flagship products include Windows, Office,
                  Azure, SQL Server, Exchange, SharePoint,
                  Dynamics ERP and CRM, as well as Xbox; Skype; and Windows Phone.`,
    native_name: 'Osohumoto',
    type: 'Private company',
    phone_number: '(+372) 666 6666',
    country: 'Estonia',
    postal: '74309',
  },
];
