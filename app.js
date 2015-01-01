(function() {
  var app = angular.module('magnet', []);

  var dataset = 
	        {name:'List of killings by law enforcement officers in the United States', 
	        data:'test.json', 
	        from:'Wikipedia',
	        desc:'"Listed below are lists of people killed by nonmilitary law enforcement officers, whether in the line of duty or not, and regardless of reason or method. Inclusion in the lists implies neither wrongdoing nor justification on the part of the person killed or the officer involved. The listing merely documents the occurrence of a death. The lists below are incomplete, as the annual average number of justifiable homicides alone is estimated to be near 400. Although Congress instructed the Attorney General in 1994 to compile and publish annual statistics on police use of excessive force, this was never carried out, and the FBI does not collect this data either."',
	    	link:'http://en.wikipedia.org/wiki/List_of_killings_by_law_enforcement_officers_in_the_United_States'};

  var numComps = ['equals','greater than'];
  var numRights = ['input','other'];

  var strComps = ['contains', 'starts with'];
  var strRights = ['sInput','sOther'];



app.controller('MagnetController', function($http, $scope){
   	var viz = this;
   	$scope.myDataset=dataset;

   	$scope.onDatasetChange = function(newDataset){
   		d3.select("svg").selectAll("*").remove();
   		$http.get(newDataset.data).success(function(data) {
  		viz.data = data;
  	});
   		};
  	
   	$http.get($scope.myDataset.data).success(function(data) {
  		viz.data = data;
	  	});
  	});

app.directive('magnet', function(){
  	var magnet = this;

  	function link(scope, el, attr){
  		el = el[0];
  		var width = window.innerWidth -200;
  		var height = width*.5;
  		var radius = 10;

  		var fill = d3.scale.category10();

		var nodes = [];

		var force = d3.layout.force()
		    .nodes(nodes)
		    .size([width, height])
		    .charge(-40)
		    .on("tick", tick)
		    .start();

  		var svg = d3.select(el).append('svg')
          .attr({width: width, height: height})
          .style('border', '1px solid lightgrey');


        var node = svg.selectAll(".node");
        var magnets = svg.selectAll(".magnet");

		function tick(e) {
			magnets = d3.selectAll(".magnet");

			node.transition().duration(50)
			.attr("cx", function(d) { 
				if (magnets[0].length > 0) {
					var newX = 0;
					var xCount = 0;
					for (i = 0; i < magnets[0].length; i++){
						if (true) {
							newX = newX + magnets[0][i].cx.baseVal.value;
							xCount = xCount + 1;
						}
					}
					newX = newX / xCount;
					return d.x - (width/2)+ newX;
				}
				return d.x; 
			}).attr("cy", function(d) { 
      			if (magnets[0].length > 0) {
      				var newY = 0;
      				var yCount =0;
					for (i = 0; i < magnets[0].length; i++){
						if (true) {
							newY = newY + magnets[0][i].cy.baseVal.value;
							yCount = yCount + 1;
						}
					}
					newY = newY / yCount;
					return d.y - (height/2)+ newY;
				}
      				return d.y; });
		}

		function startData() {
			node = node.data(force.nodes(), function(d) { return d.id;});
			node.enter().append("circle")
			  				.attr("r", 8)
			  				.attr("class", 'point');
			node.exit().remove();
			force.start();
		}

	    var drag = d3.behavior.drag()
	    			.on('drag', function() {
	    				var circle = d3.select(this);
	    				circle.attr('cx', d3.event.x)
	    						.attr('cy', d3.event.y);
	    					tick();
	    					});

		scope.submit = function(){
	    	scope.showCreate = false;
	    	var newX = (Math.random() * (width-250))+25;
	    	var newY = (Math.random() * (height-75))+25;
	    	svg.append('circle').attr("cx", newX)
								.attr("cy", newY)
								.attr("r", radius)
								.attr('class', 'magnet')
								.call(drag)
								.style("fill", "orange");
			tick();				
	    }

  		scope.$watch('data', function(data){
	  		if(data){	
	  			scope.lefts = Object.keys(data[0]);
	  			scope.selectedLeft = scope.lefts[0];

	  			if(typeof(eval("data[0]."+scope.selectedLeft))=="string") {
	  				scope.comps = strComps;
	  				scope.rights = strRights;
	  				
	  			}
	  			if(typeof(eval("data[0]."+scope.selectedLeft))=="number") {
	  				scope.comps = numComps;
	  				scope.rights = numRights;
	  			}
	  			scope.selectedComp = scope.comps[0];
	  			scope.selectedRight = scope.rights[0];

	  			//generate dataPoint nodes
	  			for (i=0;i<data.length;i++){
	  				var a = {id:i, data:data[i], type:"point"};
	  				console.log(a);
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
