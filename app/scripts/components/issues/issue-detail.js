import template from './issue-detail.html';

const issueDetail = {
  template,
  controller: class IssueDetailController {
    constructor($q, $stateParams, $state, $rootScope, issuesService, usersService) {
      // @ngInject
      this.$q = $q;
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.issuesService = issuesService;
      this.usersService = usersService;
    }

    $onInit() {
      this.loading = true;
      this.loadData()
        .catch(response => {
          if (response.status == 404) {
            this.$state.go('errorPage.notFound');
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }

    loadData() {
      return this.$q.all([
        this.usersService.getCurrentUser().then(user => this.currentUser = user),
        this.issuesService.$get(this.$stateParams.uuid).then(issue => this.issue = issue)
      ]);
    }

    showLink() {
      return this.issue.link && (this.currentUser.is_staff || this.currentUser.is_support);
    }

    onCommentCreated() {
      this.$rootScope.$emit('refreshCommentsList');
    }
  }
};

export default issueDetail;
