const issueTypeIcon = {
  template: '<i ng-class="$ctrl.iconClass" uib-tooltip="{{ $ctrl.tooltip }}"></i>',
  bindings: {
    type: '@',
  },
  controller: class IssueTypeController{
    // @ngInject
    constructor($filter, ISSUE_ICONS, ISSUE_TEXT_CLASSES) {
      this.$filter = $filter;
      this.ISSUE_ICONS = ISSUE_ICONS;
      this.ISSUE_TEXT_CLASSES = ISSUE_TEXT_CLASSES;
    }

    $onInit() {
      const type = this.type.toUpperCase().replace(' ', '_');
      const iconClass = this.ISSUE_ICONS[type] || this.ISSUE_ICONS.INCIDENT;
      const textClass = this.ISSUE_TEXT_CLASSES[type] || this.ISSUE_TEXT_CLASSES.INCIDENT;
      this.iconClass = `fa ${iconClass} ${textClass}`;
      this.tooltip = this.$filter('translate')(this.type).toUpperCase();
    }
  }
};

export default issueTypeIcon;
