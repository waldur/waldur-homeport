// @ngInject
export default function costPlanOptimizerService($http) {
  let postprocessors = [];

  postprocessors.push(plan => angular.extend({}, plan, {
    price: parseFloat(plan.price)
  }));

  return {
    pushPostprocessor(postprocessor) {
      postprocessors.push(postprocessor);
    },

    applyPostprocessors(items) {
      return items.map(item =>
        postprocessors.reduce((result, postprocessor) =>
          postprocessor(result), item)
        );
    },

    evaluate(plan) {
      return $http.get(`${plan.url}evaluate/`)
        .then(response => this.applyPostprocessors(response.data));
    }
  };
}
