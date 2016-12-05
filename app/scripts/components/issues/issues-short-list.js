import { ISSUE_CLASSES } from './constants';
import template from './issues-short-list.html';

export default function issuesShortList() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesShortListController,
    controllerAs: '$ctrl',
    scope: {
      label: '=',
      filter: '='
    },
    bindToController: true
  };
}

// ngInject
class IssuesShortListController {
  constructor(FakeIssuesService, $uibModal) {
    this.service = FakeIssuesService;
    this.$uibModal = $uibModal;
    this.init();
  }

  init() {
    this.loading = true;
    this.service.getList(this.filter).then(items => {
      this.items = items.map(item => {
        item.labelClass = ISSUE_CLASSES[item.type];
        return item;
      });
      this.loading = false;
    });    
  }

  openUserDialog(user) {
    this.$uibModal.open({
      component: 'userPopover',
      resolve: {
        user: () => user
      }
    });
  }

  openCustomerDialog(customer) {
    this.$uibModal.open({
      component: 'customerPopover',
      resolve: {
        customer: () => customer
      }
    });
  }
}
