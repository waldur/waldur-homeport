// @ngInject
export default function costPlanOptimizerService($http) {
  let postprocessors = [];

  postprocessors.push(plan => angular.extend({}, plan, {
    price: parseFloat(plan.price)
  }));

  function comparePrices(a, b) {
    if (b.price === null) {
      return -1;
    }
    if (a.price === null) {
      return 1;
    }
    return a.price - b.price;
  }

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
        .then(response => response.data)
        .then(items => items.sort(comparePrices))
        .then(items => this.applyPostprocessors(items));
    }
  };
}
