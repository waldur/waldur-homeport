import template from './freeipa-quota.html';

const freeipaQuota = {
  template,
  bindings: {
    quota: '<',
    canManage: '<',
    currency: '<',
  },
};

export default freeipaQuota;
