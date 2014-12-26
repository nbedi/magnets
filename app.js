(function() {
  var app = angular.module('magnet', []);

  var datasets = [
	        {name:'List of killings by law enforcement officers in the United States', data:'test.json', from:'Wikipedia',
	        desc:'"Listed below are lists of people killed by nonmilitary law enforcement officers, whether in the line of duty or not, and regardless of reason or method. Inclusion in the lists implies neither wrongdoing nor justification on the part of the person killed or the officer involved. The listing merely documents the occurrence of a death. The lists below are incomplete, as the annual average number of justifiable homicides alone is estimated to be near 400. Although Congress instructed the Attorney General in 1994 to compile and publish annual statistics on police use of excessive force, this was never carried out, and the FBI does not collect this data either."',
	    	link:'http://en.wikipedia.org/wiki/List_of_killings_by_law_enforcement_officers_in_the_United_States'},
	        {name:'Blank', data:'x.json'}
	      ];

  app.controller('MagnetController', function($http, $scope){
   	var table = this;
   	$scope.datasets=datasets;
   	$scope.myDataset=datasets[0];

   	$scope.onDatasetChange = function(newDataset){
   		d3.select("svg").selectAll("*").remove();
   		$http.get(newDataset.data).success(function(data) {
   		
  		table.killings = data;
  	});
   		};
  	
   	$http.get($scope.myDataset.data).success(function(data) {
  		table.killings = data;
	  	});
  	});

  app.directive('magnet', function(){

  	var magnet = this;

  	function link(scope, el, attr){
  		el = el[0];
  		var width = window.innerWidth+100;
  		var height = 700;
  		var radius = 10;

  		var fill = d3.scale.category10();

		var nodes = [];

		var force = d3.layout.force()
		    .nodes(nodes)
		    .size([width, height])
		    .on("tick", tick)
		    .start();

		force.charge(function(node) {
				if (node.type=="point");
				return -30;
		    });

  		var svg = d3.select(el).append('svg')
          .attr({width: width, height: height})
          .style('border', '1px solid lightgrey');


        var node = svg.selectAll(".node");

		function tick(e) {
			// Push different nodes in different directions for clustering.
			// var magnets = svg.selectAll(".magnet");
			// if (magnets[0].length > 0) {
			// 	var kx = d3.select(magnets[0][0]).attr("cx");
			// 	var ky = d3.select(magnets[0][0]).attr("cy");
			// 	var k = 10*e.alpha;
			// 		nodes.forEach(function(o, i) {
			// 		o.y +=k;
			// 		o.x += k;
			// 		});
			// }
			node.attr("cx", function(d) { return d.x; })
      			.attr("cy", function(d) { return d.y; });
		}

		function startData() {
			node = node.data(force.nodes(), function(d) { return d.id;});
			node.enter().append("circle")
			  				.attr("r", 8)
			  				.attr("class", 'point')
			  				.attr("magnet",0);
			node.exit().remove();

			force.start();
		}

		function startMagnet() {
			node = node.data(force.nodes(), function(d) { return d.id;});
			node.enter().append("circle")
			  				.attr("r", 15)
			  				.attr("class", 'magnet')
			  				.attr("cx",(Math.random() * (width-50))+25)
			  				.attr("cy",(Math.random() * (height-75))+25)
			  				.call(force.drag);
			node.exit().remove();

			force.start();
		}

	    magnet.fields1 = [
	        {name:'2014'},
	        {name:'2013'},
	        {name:'2012'},
	        {name:'2011'},
	        {name:'2010'}
	    ];

	    magnet.myField1 = [{name:"test"}];

	    var drag = d3.behavior.drag()
	    			.on('drag', function() {
	    				var circle = d3.select(this);
	    				circle.attr('cx', d3.event.x)
	    						.attr('cy', d3.event.y);
	    					})
	    			.on('dragend', function(){
	    				magneticMove();
	    			});


	    var magnetCount = 0;
		scope.submit = function(){
			console.log(nodes);
	    	scope.showCreate = false;
	    	var newX = (Math.random() * (width-50))+25;
	    	var newY = (Math.random() * (height-75))+25;
	    	var a = {type:"magnet"};
	  		nodes.push(a);
		  	magnetCount++;
			startMagnet();
			tick();							
	    }

  		scope.$watch('data', function(data){
	  		if(data){	
	  			for (i=0;i<data.length;i++){
	  				var a = {id:i, type:"point"};
	  				nodes.push(a);
	  			}
	  			startData();
	  		}
  		})	
  	}
  	return {
  		link: link,
  		restrict: 'E',
  		scope: {
  			data: '='
  		},
  		templateUrl: 'magnet.html'
  	}
  });
})();

 //  app.directive('test', function(){
 //  	var width = window.innerWidth-200;
 //  	var height = 600;

	// var fill = d3.scale.category10();

	// var nodes = d3.range(100).map(function(i) {
	//   return {index: i};
	// });

	// var force = d3.layout.force()
	//     .nodes(nodes)
	//     .size([width, height])
	//     .on("tick", tick)
	//     .start();

	// var svg = d3.select("body").append("svg")
	//     .attr("width", width)
	//     .attr("height", height)
	//     .style('border', '1px solid lightgrey');

	// var node = svg.selectAll(".node")
	//     .data(nodes)
	//   .enter().append("circle")
	//     .attr("class", "node")
	//     .attr("cx", function(d) { return d.x; })
	//     .attr("cy", function(d) { return d.y; })
	//     .attr("r", 8)
	//     .style("fill", function(d, i) { return fill(i & 3); })
	//     .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
	//     .call(force.drag)
	//     .on("mousedown", function() { d3.event.stopPropagation(); });

	// svg.style("opacity", 1e-6)
	//   .transition()
	//     .duration(1000)
	//     .style("opacity", 1);

	// d3.select("body")
	//     .on("mousedown", mousedown);

	// function tick(e) {

	//   // Push different nodes in different directions for clustering.
	//   var k = 6 * e.alpha;
	//   nodes.forEach(function(o, i) {
	//     o.y += i & 1 ? k : -k;
	//     o.x += i & 2 ? k : -k;
	//   });

	//   node.attr("cx", function(d) { return d.x; })
	//       .attr("cy", function(d) { return d.y; });
	// }

	// function mousedown() {
	//   nodes.forEach(function(o, i) {
	//     o.x += (Math.random() - .5) * 40;
	//     o.y += (Math.random() - .5) * 40;
	//   });
	//   force.resume();
	// }

	// return {
 //  		restrict: 'E',
 //  		scope: {
 //  			data: '='
 //  		}
 //  	}
 //  });
////////////////////////////////////////
	    // var magneticMove = function(){
	    // 	var points = svg.selectAll(".point");
	    // 	var magnets = svg.selectAll(".magnet");

	    // 	for(i=0;i<points.length;i++){
	    // 		var xMagnetTotal=0;
	    // 		var yMagnetTotal=0;
	    // 		for(j=0;j<magnets.length;j++){
	    // 			xMagnetTotal+=magnet[j].cx;
	    // 			yMagnetTotal+=magnet[j].cy;
	    // 		}
	    // 		var newX = xMagnetTotal / (magnets.length);
	    // 		var newY = yMagnetTotal / (magnets.length);
	    // 		points[i].transition()
				 //  .attr("cx", newX)
				 //  .attr("cy", newY);
	    // 	}
	    // }

 //    this.killings = [];

 //    $scope.sortOptions = [{
 //    	column: 'date',
 //    	descending: false,
 //    	sortSym: String.fromCharCode(9660)
 //    },
 //    {
 //    	column: 'name',
 //    	descending: false,
 //    	sortSym: ''
 //    },
 //    {
 //    	column: 'state',
 //    	descending: false,
 //    	sortSym: ''
 //    }];

	// $scope.years = years;
	// $scope.myYear = $scope.years[0];

	// $scope.months = months;
	// $scope.myMonth = $scope.months[0];

 //    $scope.test = 'none';

 //    $scope.sortedColumn = $scope.sortOptions[0];

 //    $scope.click = function(dataPoint){
 //    	$scope.test = dataPoint;
 //    }

 //    $scope.sort = function(index) {
 //    	if($scope.sortedColumn.column == $scope.sortOptions[index].column){
 //    		$scope.sortedColumn.descending = !$scope.sortedColumn.descending;
 //    		if($scope.sortedColumn.descending){
 //    			$scope.sortedColumn.sortSym = String.fromCharCode(9650);
 //    		}
 //    		else{
 //    			$scope.sortedColumn.sortSym = String.fromCharCode(9660);
 //    		}
 //    	}
 //    	else{
 //    		$scope.sortedColumn.sortSym = '';
 //    		$scope.sortedColumn = $scope.sortOptions[index];
 //    		$scope.sortedColumn.descending = false;
 //    		$scope.sortedColumn.sortSym = String.fromCharCode(9660);
 //    	}
 //    }

  // app.filter('year', function() {
  // 		return function(inputs, year, month) {
  // 			var outputs = inputs;
  // 			return outputs.filter(function (el) {
  // 				if (el.date){
  // 				return el.date.substring(5, 7) == month.number &&
  // 							el.date.substring(0,4) == year.name
  // 					;
  // 			}
  // 			});
  // 		};
  // 	});