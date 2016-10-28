import sparkline from './components/sparkline/sparkline';
import visibleIf from './components/visibleIf/visibleIf';
import userSelector from './components/team/user-selector';
import addProjectMember from './components/team/add-project-member';
import addTeamMember from './components/team/add-team-member';
import appstoreCategorySelector from './components/appstore/category-selector';

const module = angular.module('ncsaas');

module.directive('sparkline', sparkline);
module.directive('visibleIf', visibleIf);
module.directive('userSelector', userSelector);
module.directive('addProjectMember', addProjectMember);
module.directive('addTeamMember', addTeamMember);
module.directive('appstoreCategorySelector', appstoreCategorySelector);
