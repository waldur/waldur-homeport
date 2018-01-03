import { $state } from '@waldur/core/services';

export const gotoResource = (type, uuid) => {
  $state.go('resources.details', {
    resource_type: type,
    uuid,
  });
};
