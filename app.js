(function() {
  var app = angular.module('watch', []);

  app.controller('WatchController', function($http){
  	var table = this;
    this.killings = [];

    $http.get("test.json").success(function(data) {
  		table.killings = data;
  	});
  });

})();