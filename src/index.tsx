import ReactDOM from 'react-dom';

import './vendor';
import './sass/style.scss';
import '../svgfonts.font';

import { Application } from './Application';
import './auth/module';
import './digitalocean/module';
import './issues/module';
import './customer/module';
import './invoices/module';
import './offering/module';
import './openstack/module';
import './project/module';
import './rancher/module';
import './resource/module';
import './slurm/module';
import './user/module';
import './azure/module';
import './booking/marketplace';
import './marketplace/sidebar';
import './marketplace-script/marketplace';
import './marketplace-checklist/sidebar-extension';
import './paypal/events';
import './vmware/module';

ReactDOM.render(<Application />, document.getElementById('react-root'));
