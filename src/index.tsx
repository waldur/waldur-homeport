import ReactDOM from 'react-dom';

import './vendor';
import './sass/style.scss';

import { Application } from './Application';

import './digitalocean/module';
import './support/module';
import './openstack/module';
import './rancher/module';
import './slurm/module';
import './azure/module';
import './booking/marketplace';
import './marketplace/sidebar';
import './marketplace-script/marketplace';
import './marketplace-remote/marketplace';
import './marketplace-checklist/sidebar-extension';
import './vmware/module';

ReactDOM.render(<Application />, document.getElementById('react-root'));
