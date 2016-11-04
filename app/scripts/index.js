import sparkline from './components/sparkline/sparkline';
import visibleIf from './components/visibleIf/visibleIf';
import appstoreCategorySelector from './components/appstore/category-selector';
import teamModule from './components/team/module';
import issuesModule from './components/issues/module';
import userModule from './components/user/module';
import providersModule from './components/providers/module';
import actionsModule from './components/actions/module';

const module = angular.module('ncsaas');

module.directive('sparkline', sparkline);
module.directive('visibleIf', visibleIf);
module.directive('appstoreCategorySelector', appstoreCategorySelector);
teamModule(module);
issuesModule(module);
userModule(module);
providersModule(module);
actionsModule(module);
