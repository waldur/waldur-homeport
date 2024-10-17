import { createRoot } from 'react-dom/client';

import './vendor';
import './sass/noscript.scss';
import { Application } from './Application';

import './auth/module';
import './issues/module';
import './customer/module';
import './permissions/events';
import './invoices/module';
import './support/module';
import './openstack/module';
import './project/module';
import './rancher/module';
import './resource/module';
import './slurm/module';
import './user/module';
import './azure/module';
import './booking/marketplace';
import './marketplace-script/marketplace';
import './marketplace-remote/module';
import './paypal/events';
import './vmware/module';

const domNode = document.getElementById('react-root');
const root = createRoot(domNode);
root.render(<Application />);
