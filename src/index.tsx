import './vendor';
import './sass/noscript.scss';

import ReactDOM from 'react-dom';

import { Application } from './Application';

import './auth/module';
import './digitalocean/module';
import './issues/module';
import './customer/module';
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
import './marketplace-remote/marketplace';
import './paypal/events';
import './vmware/module';

ReactDOM.render(<Application />, document.getElementById('react-root'));
