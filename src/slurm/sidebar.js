import { ICON_CLASS, FEATURE } from './constants';

// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return [
      {
        label: gettext('Batch processing'),
        icon: ICON_CLASS,
        link: 'project.resources.slurm({uuid: $ctrl.context.project.uuid})',
        feature: FEATURE,
        parent: 'resources',
        countFieldKey: 'slurm',
        index: 1000,
      }
    ];
  });
}
