'use strict';

(function() {
  angular.module('ncsaas')
    .controller('IssueListController',
      ['baseControllerListClass', 'issuesService', 'issueCommentsService', '$scope', IssueListController]);

  function IssueListController(baseControllerListClass, issuesService, issueCommentsService, $scope) {
    var controllerScope = this;
    var controllerClass = baseControllerListClass.extend({
      issueComments: {},

      init:function() {
        this.service = issuesService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'search';
      },
      showMore: function(issue) {
        if (!this.issueComments[issue.key]) {
          this.getCommentsForIssue(issue.key);
        }
      },
      getCommentsForIssue: function(key, page) {
        var vm = this;
        var filter = {
          key: key
        };
        vm.issueComments[key] = {data:null};
        page = page || 1;
        issueCommentsService.page = page;
        issueCommentsService.pageSize = 5;
        vm.issueComments[key].page = page;
        issueCommentsService.filterByCustomer = false;
        issueCommentsService.getList(filter).then(function(response) {
          vm.issueComments[key].data = response;
          vm.issueComments[key].pages = issueCommentsService.pages;
          $scope.$broadcast('mini-pagination:getNumberList', vm.issueComments[key].pages,
            page, vm.getCommentsForIssue.bind(vm), 'comments', key);
        });
      },
      addComment: function(issue) {
        var vm = this;
        issue.newCommentSaving = true;
        var instance = issueCommentsService.$create();
        instance.body = issue.newCommentBody;
        instance.key = issue.key;
        instance.$save(
          function() {
            vm.getCommentsForIssue(issue.key);
            issue.newCommentSaving = false;
            issue.newCommentBody = "";
          },
          function(response) {
            issue.newCommentSaving = false;
            alert(response.data.non_field_errors);
          }
        );
      },
    });

    controllerScope.__proto__ = new controllerClass();
  }


  angular.module('ncsaas')
    .controller('IssueAddController', ['issuesService', 'currentStateService',
      'baseControllerAddClass', IssueAddController]);

  function IssueAddController(
    issuesService, currentStateService, baseControllerAddClass) {
    var controllerScope = this;
    var controllerClass = baseControllerAddClass.extend({
      init: function() {
        this.service = issuesService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'support.list';
        this.issue = this.instance;
      },
      save:function() {
        var vm = this;
        vm.instance.$save(success, error);
        function success() {
          vm.afterSave();
          vm.successFlash(vm.successMessage.replace('{vm_name}', vm.instance.summary));
          vm.successRedirect();
        }
        function error(response) {
          vm.errors = response.data;
        }
      },
    });

    controllerScope.__proto__ = new controllerClass();
  }

})();
