import { UI_ROUTER_REACT_HYBRID } from '@uirouter/react-hybrid';
import angular from 'angular';
import '@uirouter/angularjs/release/stateEvents';

import './vendor';
import './sass/style.scss';
import '../svgfonts.font';

import authModule from './auth/module';
import configModule from './configs/module';
import bootstrap from './core/bootstrap';
import coreModule from './core/module';
import './customer/module';
import digitaloceanModule from './digitalocean/module';
import i18nModule from './i18n/module';
import invitationsModule from './invitations/module';
import './invoices/module';
import issuesModule from './issues/module';
import rootModule from './module';
import offeringsModule from './offering/module';
import openstackModule from './openstack/module';
import './project/module';
import rancherModule from './rancher/module';
import resourceModule from './resource/module';
import registerRoutes from './routes';
import slurmModule from './slurm/module';
import storeModule from './store/module';
import userModule from './user/module';

import './azure/module';
import './booking/marketplace';
import './marketplace/sidebar';
import './marketplace-script/marketplace';
import './marketplace-checklist/sidebar-extension';
import './paypal/events';
import './vmware/module';

const appModule = angular.module('waldur', [
  'ui.router',
  UI_ROUTER_REACT_HYBRID,
  'ui.router.state.events',
  'ngCookies',
  'ngAnimate',
  'pascalprecht.translate',
]);

rootModule(appModule);
issuesModule(appModule);
userModule(appModule);
resourceModule(appModule);
authModule(appModule);
openstackModule(appModule);
digitaloceanModule();
offeringsModule();
coreModule(appModule);
i18nModule(appModule);
configModule(appModule);
slurmModule();
storeModule(appModule);
rancherModule();
invitationsModule(appModule);

registerRoutes(appModule);

bootstrap('waldur');
