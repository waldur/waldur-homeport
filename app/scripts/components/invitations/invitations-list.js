export default function invitationsList() {
  return {
    restrict: 'E',
    controller: InvitationsListController,
    controllerAs: 'ListController',
    templateUrl: 'views/partials/filtered-list.html',
    scope: {}
  };
}

// @ngInject
function InvitationsListController(
  baseControllerListClass,
  customersService,
  currentStateService,
  usersService,
  invitationService,
  ncUtils,
  $state,
  $filter,
  $q,
  $uibModal,
  ncUtilsFlash,
  ENV
) {
  var controllerScope = this;
  var InvitationController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = invitationService;
      var fn = this._super.bind(this);
      this.loading = true;
      $q.all([
        currentStateService.getCustomer().then(customer => {
          this.currentCustomer = customer;
        }),
        usersService.getCurrentUser().then(user => {
          this.currentUser = user;
        })
      ]).then(() => {
        this.isOwnerOrStaff = customersService.checkCustomerUser(this.currentCustomer, this.currentUser);
        this.tableOptions = this.getTableOptions();
        fn();
      }).finally(() => {
        this.loading = false;
      });
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.uuid
      };
    },
    getUserFilter: function() {
      return {
        name: 'state',
        choices: [
          {
            title: gettext('Pending'),
            value: 'pending',
            chosen: true,
          },
          {
            title: gettext('Canceled'),
            value: 'canceled'
          },
          {
            title: gettext('Expired'),
            value: 'expired'
          },
          {
            title: gettext('Accepted'),
            value: 'accepted'
          }
        ]
      };
    },
    getTableOptions: function() {
      return {
        noDataText: gettext('You have no team invitations yet.'),
        noMatchesText: gettext('No invitations found matching filter.'),
        enableOrdering: true,
        columns: [
          {
            title: gettext('Email'),
            className: 'all',
            orderField: 'email',
            render: function(row) {
              var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                .replace('{gravatarSrc}', row.email);
              return avatar + ' ' + row.email;
            }
          },
          {
            title: gettext('Role'),
            className: 'min-tablet-l',
            orderable: false,
            render: function(row) {
              if (row.customer_role) {
                return ENV.roles.owner;
              } else if (row.project_role) {
                var href = $state.href('project.details', {
                  uuid: ncUtils.getUUID(row.project)
                });
                var roleTitle = ENV.roles[row.project_role] || 'Unknown';
                var title = roleTitle + ' in ' + row.project_name;
                return ncUtils.renderLink(href, title);
              }
            }
          },
          {
            title: gettext('Status'),
            className: 'min-tablet-l',
            orderField: 'state',
            render: function(row) {
              return row.state;
            }
          },
          {
            title: gettext('Created at'),
            className: 'min-tablet-l',
            orderField: 'created',
            render: function(row) {
              return $filter('shortDate')(row.created);
            }
          },
          {
            title: gettext('Expires at'),
            className: 'min-tablet-l',
            orderable: false,
            render: function(row) {
              return $filter('shortDate')(row.expires);
            }
          },
          {
            title: gettext('URL'),
            className: 'none',
            orderable: false,
            render: function(row) {
              return row.link_template.replace('{uuid}', row.uuid);
            }
          }
        ],
        tableActions: this.getTableActions(),
        rowActions: this.getRowActions()
      };
    },
    getTableActions: function() {
      return [
        {
          title: gettext('Invite user'),
          iconClass: 'fa fa-plus',
          callback: this.openDialog.bind(this),
          disabled: !this.isOwnerOrStaff,
          titleAttr: !this.isOwnerOrStaff && gettext('Only customer owner or staff can invite users.')
        }
      ];
    },
    openDialog: function() {
      $uibModal.open({
        component: 'invitationDialog',
        resolve: {
          customer: () => {
            return this.currentCustomer;
          }
        }
      }).result.then(function() {
        controllerScope.resetCache();
      });
    },
    getRowActions: function() {
      if (this.isOwnerOrStaff) {
        return [
          {
            title: gettext('Cancel'),
            iconClass: 'fa fa-ban',
            callback: this.cancelInvitation.bind(this),
            isDisabled: function(row) {
              return row.state !== 'pending';
            },
            tooltip: function(row) {
              if (row.state !== 'pending') {
                return gettext('Only pending invitation can be canceled.');
              }
            }
          },
          {
            title: gettext('Resend'),
            iconClass: 'fa fa-envelope-o',
            callback: this.resendInvitation.bind(this),
            isDisabled: function(row) {
              return row.state !== 'pending';
            },
            tooltip: function(row) {
              if (row.state !== 'pending') {
                return gettext('Only pending invitation can be sent again.');
              }
            }
          }
        ];
      }
    },
    cancelInvitation: function(row) {
      invitationService.cancel(row.uuid).then(function() {
        ncUtilsFlash.success('Invitation has been canceled.');
        row.state = 'canceled';
        controllerScope.resetCache();
      }).catch(function() {
        ncUtilsFlash.error('Unable to cancel invitation.');
      });
    },
    resendInvitation: function(row) {
      invitationService.resend(row.uuid).then(function() {
        ncUtilsFlash.success('Invitation has been sent again.');
      }).catch(function() {
        ncUtilsFlash.error('Unable to resend invitation.');
      });
    }
  });
  controllerScope.__proto__ = new InvitationController();
}
