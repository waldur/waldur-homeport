// @ngInject
export default function CustomerInvitationsTabController(
  baseControllerListClass,
  customersService,
  currentCustomer,
  currentUser,
  invitationService,
  ncUtils,
  $state,
  $filter,
  $uibModal,
  ncUtilsFlash,
  ENV
) {
  var controllerScope = this;
  var InvitationController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = invitationService;
      this.isOwnerOrStaff = customersService.checkCustomerUser(currentCustomer, currentUser);
      this.tableOptions = this.getTableOptions();
      this.getSearchFilters();
      this._super();
    },
    getSearchFilters: function() {
      this.searchFilters = [
        {
          name: 'state',
          title: 'Pending',
          value: 'pending'
        },
        {
          name: 'state',
          title: 'Canceled',
          value: 'canceled'
        },
        {
          name: 'state',
          title: 'Expired',
          value: 'expired'
        },
        {
          name: 'state',
          title: 'Accepted',
          value: 'accepted'
        }
      ];
    },
    getTableOptions: function() {
      return {
        noDataText: 'You have no team invitations yet',
        noMatchesText: 'No invitations found matching filter.',
        columns: [
          {
            title: 'E-mail',
            className: 'all',
            render: function(data, type, row, meta) {
              var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                .replace('{gravatarSrc}', row.email);
              return avatar + ' ' + row.email;
            }
          },
          {
            title: 'Role',
            className: 'min-tablet-l',
            render: function(data, type, row, meta) {
              if (row.customer) {
                return ENV.roles.owner;
              } else if (row.project) {
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
            title: 'Status',
            className: 'min-tablet-l',
            render: function(data, type, row, meta) {
              return row.state;
            }
          },
          {
            title: 'Created at',
            className: 'min-tablet-l',
            render: function(data, type, row, meta) {
              return $filter('shortDate')(row.created);
            }
          },
          {
            title: 'Expires at',
            className: 'min-tablet-l',
            render: function(data, type, row, meta) {
              return $filter('shortDate')(row.expires);
            }
          },
          {
            title: 'URL',
            className: 'none',
            render: function(data, type, row, meta) {
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
          name: '<i class="fa fa-plus"></i> Invite user',
          callback: this.openDialog.bind(this),
          disabled: !this.isOwnerOrStaff,
          titleAttr: !this.isOwnerOrStaff && 'Only customer owner or staff can invite users.'
        }
      ];
    },
    openDialog: function() {
      $uibModal.open({
        component: 'invitationDialog',
        resolve: {
          customer: function() {
            return currentCustomer;
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
            name: '<i class="fa fa-ban"></i> Cancel',
            callback: this.cancelInvitation.bind(this),
            isDisabled: function(row) {
              return row.state !== 'pending';
            },
            tooltip: function(row) {
              if (row.state !== 'pending') {
                return 'Only pending invitation can be canceled.';
              }
            }
          },
          {
            name: '<i class="fa fa-envelope-o"></i> Resend',
            callback: this.resendInvitation.bind(this),
            isDisabled: function(row) {
              return row.state !== 'pending';
            },
            tooltip: function(row) {
              if (row.state !== 'pending') {
                return 'Only pending invitation can be sent again.';
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
