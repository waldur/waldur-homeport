import { ISSUE_TYPE_CHOICES, ISSUE_IDS } from './constants';

// @ngInject
export default function IssueTypesService(ENV, usersService) {
  return {
    getAllTypes,
    getDefaultType,
  };

  function getAllTypes() {
    return showAllTypes().then(result => {
      if (result) {
        return ISSUE_TYPE_CHOICES;
      } else {
        return ISSUE_TYPE_CHOICES.filter(x => x.id !== ISSUE_IDS.CHANGE_REQUEST);
      }
    });
  }

  function getDefaultType() {
    return showAllTypes().then(result => {
      if (result) {
        return ISSUE_IDS.CHANGE_REQUEST;
      } else {
        return ISSUE_IDS.INFORMATIONAL;
      }
    });
  }

  function showAllTypes() {
    return usersService.getCurrentUser().then(user => {
      return !ENV.concealChangeRequest || user.is_staff || user.is_support;
    });
  }
}
