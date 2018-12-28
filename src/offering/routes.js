import { OracleOfferingTypes } from '@waldur/offering/utils';

// @ngInject
function oracleRequestList($scope) {
  $scope.oracleFilter = {type: OracleOfferingTypes};
}

// @ngInject
export default function offeringRoutes($stateProvider) {
  $stateProvider

  .state('appstore.offering', {
    url: 'offering/:category/',
    template: '<appstore-offering></appstore-offering>',
    data: {
      category: 'offerings',
      pageTitle: gettext('Requests'),
      sidebarState: 'project.resources',
      feature: 'offering',
    }
  })

  .state('offeringDetails', {
    url: '/offering/:uuid/',
    template: '<offering-details></offering-details>',
    feature: 'offering',
  })

  .state('project.resources.offerings', {
    url: 'offerings/',
    template: '<project-offerings-list></project-offerings-list>',
    data: {
      pageTitle: gettext('Requests'),
      feature: 'offering'
    }
  })

  .state('project.resources.oracle', {
    url: 'oracle/',
    template: '<project-offerings-list filter="oracleFilter"></project-offerings-list>',
    data: {
      pageTitle: gettext('Oracle'),
      feature: 'oracle'
    },
    controller: oracleRequestList,
  });

}
