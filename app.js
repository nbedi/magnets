(function() {
	var app = angular.module('magnet', []);

	var dataset = 
	        {name:'List of killings by law enforcement officers in the United States', 
	        data:'test.json', 
	        from:'Wikipedia',
	        desc:'"Listed below are lists of people killed by nonmilitary law enforcement officers, whether in the line of duty or not, and regardless of reason or method. Inclusion in the lists implies neither wrongdoing nor justification on the part of the person killed or the officer involved. The listing merely documents the occurrence of a death. The lists below are incomplete, as the annual average number of justifiable homicides alone is estimated to be near 400. Although Congress instructed the Attorney General in 1994 to compile and publish annual statistics on police use of excessive force, this was never carried out, and the FBI does not collect this data either."',
	    	link:'http://en.wikipedia.org/wiki/List_of_killings_by_law_enforcement_officers_in_the_United_States'};

	var numComps = [{name:'equals'}, {name:'greater than'}, {name:'less than'}];
	var numRights = ['input','other'];

	var strComps = [{name:'contains', op:'contains'}, {name:'before (alphabetically)', op:'<'}, {name:'after (alphabetically)', op:'>'}];
	var strRights = ['sInput','sOther'];

	var dateComps = [{name:'before', op: '<'}, {name:'after', op: '>'}, {name:'equals', op:'='}];
	var dateRights = ['2014-01-10', '2014-01-04', '2014-01-20'];

	function isDate(val) {
	    var d = new Date(val);
	    return !isNaN(d.valueOf());
	}

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

  		var operate = {
  			'<': function(x,y) { return x < y},
  			'>': function(x,y) { return x > y},
  			'contains': function(x,y) { return x.indexOf(y)>-1}
  		}

	  	function getLeftType(val) {
	  		if(scope.data){
				if(isDate(eval("scope.data[0]."+val))){
					return "date";
				}else if(typeof(eval("scope.data[0]."+val))=="number") {
					return "number";
				}else if(typeof(eval("scope.data[0]."+val))=="string") {
					return "string";
				}
			}
		}

		function getType(val) {
			if(isDate(val)){
				return "date";
			}else if(typeof(val)=="number") {
				return "number";
			}else {
				return "string";
			}
		}

		function getData(val) {
			if (getType(val)=="date")
				return new Date(val);
			else if (getType(val)=="number")
				return new Number(val);
			else
				return val;
		}

		function isTrue(data,left,comp,right) {
			if (data) {
				if (!(getLeftType(left)==getType(right)))
					return false;
				var leftData = getData(eval("data."+left));
				var rightData = getData(right);
				var test = operate[comp.op](leftData,rightData);
				
				if (!(test))
					return false;
			}
			return true;
		}

		function errorCheck(val) {
			scope.invalidInput = "a";
			return true;
		}

  		el = el[0];
  		var width = window.innerWidth -200;
  		var height = width*.5;
  		var radius = 10;

  		var fill = d3.scale.category10();

		var nodes = [];

		var force = d3.layout.force()
		    .nodes(nodes)
		    .size([width, height])
		    .charge(-25)
		    .on("tick", tick)
		    .start();

  		var svg = d3.select(el).append('svg')
          .attr({width: width, height: height})
          .style('border', '1px solid lightgrey');


        var node = svg.selectAll(".node");
        var magnets = svg.selectAll(".magnet");

        var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-25, -40])
		  .direction('e')
      	  
		  .html(function(d) {
		    return (d.left + ' ' + d.comparator.name + ' '+ d.right);
		  })

		svg.call(tip);

		function tick(e) {
			var nodeNumX = 0;
			var nodeNumY = 0;
			magnets = d3.selectAll(".magnet");
			node.transition().duration(100)
			.attr("cx", function(d) { 
				if (magnets[0].length > 0) {
					var newX = 0;
					var xCount = 0;
					for (i = 0; i < magnets[0].length; i++){
						var left = magnets.data()[i].left;
						var right = magnets.data()[i].right;
						var comp = magnets.data()[i].comparator;
						if (errorCheck(right))
						{
							if (isTrue(node.data()[nodeNumX].data,left,comp,right)) {
								newX = newX + magnets[0][i].cx.baseVal.value;
								xCount = xCount + 1;
							}
						}
					}
					newX = newX / xCount;
					nodeNumX = nodeNumX+1;
					if (newX > 0)
						return newX;
				}
				return d.x; 
			}).attr("cy", function(d) { 
      			if (magnets[0].length > 0) {
      				var newY = 0;
      				var yCount =0;
					for (i = 0; i < magnets[0].length; i++){
						var left = magnets.data()[i].left;

						var right = magnets.data()[i].right;
						var comp = magnets.data()[i].comparator;
						if (isTrue(node.data()[nodeNumY].data,left,comp,right)) {
							newY = newY + magnets[0][i].cy.baseVal.value;
							yCount = yCount + 1;
						}
					}
					nodeNumY = nodeNumY+1;
					newY = newY / yCount;
					if (newY > 0)
						return newY;
				}
      			return d.y; });
		}

		function startData() {
			node = node.data(force.nodes(), function(d) { return d.id;});
			node.enter().append("circle")
			  				.attr("r", 5)
			  				.attr("class", 'point');
			node.exit().remove();
			force.start();
		}

	    var drag = d3.behavior.drag()
	    			.on('drag', function() {
	    				tip.hide();
	    				var circle = d3.select(this);
	    				if ((d3.event.x > circle[0][0].r.baseVal.value) &&
	    					(d3.event.x < width - circle[0][0].r.baseVal.value) &&
	    					(d3.event.y > circle[0][0].r.baseVal.value) &&
	    					(d3.event.y < height - circle[0][0].r.baseVal.value)){
		    				circle.attr('cx', d3.event.x)
		    						.attr('cy', d3.event.y);
		    				tick();
	    				}
	    					});

		scope.submit = function(){
	    	scope.showCreate = false;
	    	var newData = [{left:scope.selectedLeft, comparator:scope.selectedComp, right:scope.selectedRight}];

	    	var newX = (Math.random() * (width-250))+25;
	    	var newY = (Math.random() * (height-75))+25;
	    	svg.append('circle').data(newData)
	    						.attr("cx", newX)
								.attr("cy", newY)
								.attr("r", radius)
								.attr('class', 'magnet')
								.call(drag)
								.style("fill", "orange")
								.on('mouseover', tip.show)
      							.on('mouseout', tip.hide);
			tick();		
			force.start();

	    }

	    scope.$watch('selectedLeft', function(left){
	    	if(scope.data){
	    		if(isDate(eval("scope.data[0]."+left))){
	  				scope.comps = dateComps;
	  				// scope.rights = dateRights;
	  			}else if(typeof(eval("scope.data[0]."+left))=="number") {
	  				scope.comps = numComps;
	  				// scope.rights = numRights;
	  			}else if(typeof(eval("scope.data[0]."+left))=="string") {
	  				scope.comps = strComps;
	  				// scope.rights = strRights;
	  			}
	  			scope.selectedComp = scope.comps[0];
	  			// scope.selectedRight = scope.rights[0];
	  		}
	    })

  		scope.$watch('data', function(data){
	  		if(data){	
	  			scope.lefts = Object.keys(data[0]);
	  			scope.selectedLeft = scope.lefts[0];
	  			scope.invalidInput = "";

	  			if(isDate(eval("data[0]."+scope.selectedLeft))){
	  				scope.comps = dateComps;
	  				// scope.rights = dateRights;
	  			}else if(typeof(eval("data[0]."+scope.selectedLeft))=="number") {
	  				scope.comps = numComps;
	  				// scope.rights = numRights;
	  			}else if(typeof(eval("data[0]."+scope.selectedLeft))=="string") {
	  				scope.comps = strComps;
	  				// scope.rights = strRights;
	  			}
	  			scope.selectedComp = scope.comps[0];
	  			// scope.selectedRight = scope.rights[0];
	  			scope.selectedRight = "";

	  			//generate dataPoint nodes
	  			for (i=0;i<(data.length*2);i=i+2){
	  				var a = {id:i, data:data[i], type:"point"};
	  				var b = {id:i+1, data:data[i], type:"point"};
	  				nodes.push(a);
	  				nodes.push(b);
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
