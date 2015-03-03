
(function(){
  window.BaseServiceClass = Class.extend({
    $scope:null,

    init:function($scope){
      this.$scope = $scope;
    }
  });
  window.BaseFactoryClass = Class.extend({
    ENV:null,
    $resource:null,
    url:null,
    params:null,
    fullUrl:null,
    config:null,

    init:function(){
      this.fullUrl = this.ENV.apiEndpoint + this.url;
    },
    raw:function(){
      return this.$resource(this.fullUrl,this.params,this.config);
    }
  });
})();