export default class HttpUtils {
  /*
    This class provides utilities for fetching data from REST API.
    Ideally it should not be a class, because it doesn't have any internal state.
    The only reason to implement this class is to use AngularJS dependency injection.
  */
  // @ngInject
  constructor($http) {
    this.$http = $http;
  }

  getAll(url) {
    // Fetch and merge all pages in correct order using next page URL from header
    return this.fetchNextPage([], url);
  }

  fetchNextPage(accum, url) {
    /*
      This function uses recursion, but it should not be a problem
      because it is expected that number of pages is not big
    */
    return this.$http.get(url).then(response => {
      const nextPageUrl = this.getNextPageUrl(response);
      accum = [...accum, ...response.data];
      if (nextPageUrl) {
        return this.fetchNextPage(accum, nextPageUrl);
      } else {
        return accum;
      }
    });
  }

  getNextPageUrl(response) {
    // Extract next page URL from header links
    const link = response.headers('link');
    if (!link) {
      return null;
    }

    const nextLink = link.split(', ').filter(s => s.indexOf('rel="next"') > -1)[0];
    if (!nextLink) {
      return null;
    }

    return nextLink.split(';')[0].slice(1, -1);
  }
}
