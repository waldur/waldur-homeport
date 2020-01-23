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
      },
      {
        label: gettext('Training and education'),
        icon: ICON_CLASS,
        feature: FEATURE,
        index: 221,
        action: () => alert('This feature is not implemented yet'),
      }
    ];
  });
}
