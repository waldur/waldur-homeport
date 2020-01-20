import {FEATURE, ICON_CLASS} from './constants';

// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return [
      {
        label: gettext('Compliance'),
        icon: ICON_CLASS,
        link: 'marketplace-checklist-project({uuid: $ctrl.context.project.uuid})',
        feature: FEATURE,
        index: 220,
      }
    ];
  });
}
