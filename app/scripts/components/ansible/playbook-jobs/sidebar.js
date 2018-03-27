import {FEATURE, ICON_CLASS} from '../constants';

// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return [
      {
        label: gettext('Applications'),
        icon: ICON_CLASS,
        link: 'project.resources.ansible.list({uuid: $ctrl.context.project.uuid})',
        feature: FEATURE,
        parent: 'resources',
        countFieldKey: 'ansible',
        index: 300,
      }
    ];
  });
}
