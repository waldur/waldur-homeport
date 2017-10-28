// @ngInject
export default function quotasService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/quotas/';
    },
    getHistory: function(url, start, end, points_count) {
      return this.getList({
        start: start,
        end: end,
        points_count: points_count
      }, url + 'history/');
    }
  });
  return new ServiceClass();
}
