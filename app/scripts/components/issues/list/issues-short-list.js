import template from './issues-short-list.html';

export const issuesShortList = {
  template,
  controller: class IssuesShortListController {
    // @ngInject
    constructor(issuesService, usersService, $uibModal, ncUtils) {
      this.service = issuesService;
      this.usersService = usersService;
      this.$uibModal = $uibModal;
      this.ncUtils = ncUtils;
    }

    $onInit() {
      this.loadIssues();
    }

    loadIssues() {
      this.loading = true;
      this.usersService.getCurrentUser().then(user => {
        this.service.getList({ caller: user.url }).then(items => {
          this.items = items.map(item => {
            item.timeSpent = this.ncUtils.relativeDate(item.created);
            return item;
          });
        });
      }).finally(() => {
        this.loading = false;
      });
    }

    openUserDialog(user_uuid) {
      this.$uibModal.open({
        component: 'userPopover',
        resolve: {
          user_uuid: () => user_uuid
        }
      });
    }

    openCustomerDialog(customer_uuid) {
      this.$uibModal.open({
        component: 'customerPopover',
        size: 'lg',
        resolve: {
          customer_uuid: () => customer_uuid
        }
      });
    }
  }
};
