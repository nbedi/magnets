(function() {
  var app = angular.module('gemStore', []);

  app.controller('StoreController', function($http){
  	var table = this;
    this.killings = [];

    $http.get("test.json").success(function(data) {
  		table.killings = data;
  	});
  });

  var gems = [
    { name: 'Azurite', price: 110.50 },
    { name: 'Bloodstone', price: 22.90 },
    { name: 'Zircon', price: 1100 },
  ];

})();