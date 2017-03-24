// @ngInject
export default function costPlanOptimizerService($http) {
  let postprocessors = [];

  function comparePrice(a, b) {
    // Items without valid price should be located at the end of list
    if (!a.price) {
      return 1;
    }
    if (!b.price) {
      return -1;
    }
    return a.price - b.price;
  }

  function applyPostprocessors(items) {
    return items.map(item =>
      postprocessors.reduce((result, postprocessor) =>
        postprocessor(result), item)
      );
  }

  function parseResponse(response) {
    let plans = response.data;
    angular.forEach(plans, item => item.price = parseFloat(item.price));
    plans.sort(comparePrice);
    return applyPostprocessors(plans);
  }

  return {
    pushPostprocessor(postprocessor) {
      postprocessors.push(postprocessor);
    },

    evaluate(plan) {
      return $http.get(`${plan.url}evaluate/`).then(parseResponse);
    }
  };
}
