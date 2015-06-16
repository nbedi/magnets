(function() {
	var app = angular.module('magnet', []);

	var dataset = 
	        {name:'List of 339 open missing person cases in Los Angeles, California', 
	        data:'test2.json', 
	        from:'National Missing and Unidentified Persons System (NamUs), parsed with find-us.herokuapp.com on March 15 2014.',
	        desc:'From NamUs: "The National Missing and Unidentified Persons System (NamUs) is a national centralized repository and resource center for missing persons and unidentified decedent records. The Missing Persons Database contains information about missing persons that can be entered by anyone; however before it appears as a case on NamUs, the information is verified."',
	    	link:'https://www.findthemissing.org/en'};

	var numComps = [{name:'equals', op:'='}, {name:'greater than', op:'>'}, {name:'less than', op:'<'}, {name:'between (separate two numbers by spaces)', op:'between'}];
	var numRights = ['input','other'];

	var strComps = [{name:'equals', op:'strEq'}, {name:'contains', op:'contains'}];
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
  	
   	$http.get($scope.myDataset.data).success(function(data) {
  		viz.data = data;
	  	});
  	});

app.directive('magnet', function(){

  	var magnet = this;

  	function link(scope, el, attr){

  		var operate = {
  			'=': function(x,y) { return x.valueOf() == y.valueOf()},
  			'strEq': function(x,y) { return x.toLowerCase() == y.toLowerCase()},
  			'between': function(x,y) { 
  						var betweenArr = y.split(" ");
  						return (parseInt(betweenArr[0]) <= parseInt(x) && parseInt(x) <= betweenArr[1]);},
  			'<': function(x,y) { return x < y},
  			'>': function(x,y) { return x > y},
  			'contains': function(x,y) { if (x&&y) {return (x.toLowerCase()).indexOf(y.toLowerCase())>-1} else return false}
  		}

	  	function getLeftType(val) {
	  		if(scope.data){
				// if(getType(eval("scope.data[0]."+val))=="date"){
				// 	return "date";
				// }else 
				if(getType(scope.data[0][val])=="number") {
					return "number";
				}else if(getType(scope.data[0][val])=="string") {
					return "string";
				}
			}
		}

		function getType(val) {
			// if(isDate(val)){
			// 	return "date";
			// }else 
			if(!isNaN(val)) {
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
				var leftData = getData(eval("data."+left));
				var rightData = getData(right);
				var test = operate[comp.op](leftData,rightData);
				if (!(test)) {
					return false;
				}
			}
			return true;
		}

		function errorCheck(left, comp, right) {
			if (right=="") {
				scope.invalidInput = "Second field cannot be empty.";
				scope.invalidInd = true;
				return false;
			}
			if (comp.op=="between") {
				var betweenArr = right.split(" ");
				if (betweenArr.length != 2 || getType(betweenArr[0])!=getLeftType(left) || getType(betweenArr[1])!=getLeftType(left)) {
					scope.invalidInput = "Must have only two numbers separated by one space.";
					scope.invalidInd = true;
					return false;
				}
				scope.invalidInd = false;
				return true;
			}
			if (getLeftType(left)!=getType(right) && !(getLeftType(left)=="string")) {
				scope.invalidInput = "Second field type does not match first field type.";
				scope.invalidInd = true;
				return false;
			}
			scope.invalidInd = false;
			return true;
		}

  		el = el[0];
  		var width = window.innerWidth -150;
  		var height = width*.4;
  		var radius = 5;

  		var fill = d3.scale.category10();

		var nodes = [];

		var force = d3.layout.force()
		    .nodes(nodes)
		    .size([width, height])
		    .charge(-5)
		    .on("tick", tick)
		    .start();

  		var svg = d3.select(el).append('svg')
          .attr({width: width, height: height})
          .style('border', '1px solid lightgrey');


        var node = svg.selectAll(".node");
        var magnets = svg.selectAll(".magnet");

        var tipMagnet = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-24, -50])
		  .direction('e')
		  .html(function(d) {
		  	var right = d.right;
		  	if (right == "") {
		  		right = [empty];
		  	}
		    return (d.left + ' ' + d.comparator.name + ' '+ d.right);
		  })

		var tipPoint = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-24, -50])
		  .direction('e')
		  .html(function(d) {
		    return ("<img onerror='this.style.display = \"none\"' src='"+d.data.photo+"'/><span>" + d.data.first_name + " " + d.data.last_name);
		  })

		svg.call(tipMagnet);
		svg.call(tipPoint);

		function tick(e) {
			var k = .1 * e.alpha;
			var nodeNumX = 0;
			var nodeNumY = 0;
			magnets = svg.selectAll(".magnet");
			
			nodes.forEach(function(o,i) {
				if (magnets[0].length > 0) {
					var newX = 0;
					var pCount = 0;
					var newY = 0;
					for (i = 0; i < magnets[0].length; i++){
						var left = magnets.data()[i].left;
						var right = magnets.data()[i].right;
						var comp = magnets.data()[i].comparator;
						if (isTrue(node.data()[nodeNumX].data,left,comp,right)) {
							newX = newX + magnets[0][i].cx.baseVal.value;
							newY = newY + magnets[0][i].cy.baseVal.value;
							
							pCount = pCount + 1;
						}
					}
					newX = newX / pCount;
					nodeNumX = nodeNumX+1;
					if (newX > 0)
						o.x += (newX-(width/2)) * k;
      				
					nodeNumY = nodeNumY+1;
					newY = newY / pCount;
					if (newY > 0)
						o.y += (newY-(height/2)) * k;
				}
			});
			node.transition().duration(30)
			.attr("cx", function(d) { return d.x = Math.max(radius/3, Math.min(width - radius/3, d.x)); })
			.attr("cy", function(d) { return d.y = Math.max(radius/3, Math.min(height - radius/3, d.y)); });
		}

		function startData() {
			node = node.data(force.nodes(), function(d) { return d.id;});
			node.enter().append("circle")
			  				.attr("r", radius/2)
			  				.attr("class", 'point')
			  				.on('mouseover', tipPoint.show)
			  				.on('mouseout', tipPoint.hide);
			node.exit().remove();
			force.start();

			scope.$watch('initialmagnets', function(initial){
				var colors = ["green", "orange", "blue"];
		    	if(initial){
		    		initial = ['sex', 'race'];
		    		for(i=0;i<(initial.length);i++) {
		    			if (initial[i] in scope.data[0]) {
	    					if (getLeftType(initial[i])=="number") {
	    						ccomp = {name:'between', op:'between'};
	    						var low = Number.POSITIVE_INFINITY;
								var high = Number.NEGATIVE_INFINITY;
								var tmp;
								for (m=0;m<scope.data.length;m++) {
								    tmp = parseInt(scope.data[m][initial[i]],10);
								    if (tmp < low) low = tmp;
								    if (tmp > high) high = tmp;
								}
								high=high+1;
								var inc = parseInt(Math.ceil((high-low)/5));
								var angle = 2 * 3.14 / 5;
								for (n=0;n<5;n++) {
									var num_one = inc*n+low;
									var num_two = inc*(n+1)+low;
									var num_right = num_one + " " + num_two;
								    x = width/2 + (30 + (i*370)) * Math.sin(n * angle);
								    y = height/2 +(30 + (i*150)) * Math.cos(n * angle);
				    				customsubmit(initial[i],ccomp,num_right,x,y,colors[i%colors.length]);
								}
	    					}
	    					else if (getLeftType(initial[i])=="string") {
	    						var u = {}, d = [];
			    				for(j=0;j<scope.data.length;j++) {
			    					u[scope.data[j][initial[i]]] = 0;
			    				}
			    				var keys = Object.keys(u);
			    				var ccomp;
	    						ccomp = {name:'equals', op:'strEq'};

		    					var angle = 2 * 3.14 / keys.length;
			    				for(k=0;k<keys.length;k++) {
								    x = width/2 + (30 + (i*370)) * Math.sin(k * angle);
								    y = height/2 +(30 + (i*150)) * Math.cos(k * angle);
				    				customsubmit(initial[i],ccomp,keys[k],x,y,colors[i%colors.length]);
				    			}
		    				}
		    			}
		    		}
		    	}
	    	});
		}

		function startMagnet() {
			node = node.data(force.nodes(), function(d) { return d.id;});
			node.enter().append("circle")
			  				.attr("r", radius/4)
			  				.attr("class", 'magnet')
			  				.on('mouseover', tipPoint.show)
			  				.on('mouseout', tipPoint.hide);
			node.exit().remove();
			force.start();
		}

	    var drag = d3.behavior.drag()
	    			.on('drag', function() {
	    				tipMagnet.hide();
	    				var circle = d3.select(this);
	    				circle.attr('cx',  Math.max(radius, Math.min(width - radius, d3.event.x)))
	    						.attr('cy',  Math.max(radius, Math.min(height - radius, d3.event.y)))
	    				force.start();
	    					});

		scope.submit = function(){
			//refactor to use force layout!
	    	var newData = [{left:scope.selectedLeft, comparator:scope.selectedComp, right:scope.selectedRight}];
	    	if (errorCheck(scope.selectedLeft, scope.selectedComp, scope.selectedRight)) {
		    	var newX = (Math.random() * (width-250))+25;
		    	var newY = (Math.random() * (height-75))+25;
		    	svg.append('circle').data(newData)
		    						.attr("cx", newX)
									.attr("cy", newY)
									.attr("r", radius)
									.attr('class', 'magnet')
									.call(drag)
									.style("fill", "orange")
									.on('mouseover', tipMagnet.show)
	      							.on('mouseout', tipMagnet.hide)
	      							.on('contextmenu', function(data, index) {
	      													this.remove();
														    d3.event.preventDefault();
														});										
				force.start();
				scope.selectedRight = "";
			}
	    }

	    customsubmit = function(cleft,ccomp,cright,cx,cy,color){
			//refactor to use force layout!
	    	var newData = [{left:cleft, comparator:ccomp, right:cright}];
	    	if (errorCheck(cleft, ccomp, cright)) {
		    	var newX = cx;
		    	var newY = cy;
		    	svg.append('circle').data(newData)
		    						.attr("cx", newX)
									.attr("cy", newY)
									.attr("r", radius)
									.attr('class', 'magnet')
									.call(drag)
									.style("fill", color)
									.on('mouseover', tipMagnet.show)
	      							.on('mouseout', tipMagnet.hide)
	      							.on('contextmenu', function(data, index) {
	      													this.remove();
														    d3.event.preventDefault();
														});										
				force.start();
				scope.selectedRight = "";
			}
	    }

	    scope.clearMagnets = function(){
	    	magnets = svg.selectAll(".magnet");
	    	magnets.remove();
	    }

	    scope.$watch('selectedLeft', function(left){
	    	if(scope.data){
	    		if(getLeftType(left)=="date"){
	  				scope.comps = dateComps;
	  				// scope.rights = dateRights;
	  			}else if(getLeftType(left)=="number") {
	  				scope.comps = numComps;
	  				// scope.rights = numRights;
	  			}else if(getLeftType(left)=="string") {
	  				scope.comps = strComps;
	  				// scope.rights = strRights;
	  			}
	  			scope.selectedComp = scope.comps[0];
	  			scope.suggestions = [];
	  			i=0;
	  			for(j=0;j<scope.data.length;j++) {
	  				if (scope.suggestions.indexOf(scope.data[j][scope.selectedLeft]) < 0) {
	  					scope.suggestions[i]=scope.data[j][scope.selectedLeft];
	  					i++;
	  				}
	  			}
	  			// scope.selectedRight = scope.rights[0];
	  		}
	    })

  		scope.$watch('data', function(data){
	  		if(data){
	  			scope.invalidInd = false;
	  			//TODO: refactor soon
	  			delete data[0].photo;
	  			delete data[0].agency_name;
	  			delete data[0].org;
	  			delete data[0].county;
	  			delete data[0].agency_contact;
	  			delete data[0].namus_number;
	  			delete data[0].ncmec_number;
	  			delete data[0].org_contact;
	  			delete data[0].aged_photo;
	  			delete data[0].org_name;
	  			scope.lefts = Object.keys(data[0]);
	  			scope.selectedLeft = scope.lefts[0];
	  			scope.invalidInput = "";
	  			if(getType(eval("data[0]."+scope.selectedLeft))=="date"){
	  				scope.comps = dateComps;
	  				// scope.rights = dateRights;
	  			}else if(getType(eval("data[0]."+scope.selectedLeft))=="number") {
	  				scope.comps = numComps;
	  				// scope.rights = numRights;
	  			}else if(getType(eval("data[0]."+scope.selectedLeft))=="string") {
	  				scope.comps = strComps;
	  				// scope.rights = strRights;
	  			}
	  			scope.selectedComp = scope.comps[0];
	  			// scope.selectedRight = scope.rights[0];
	  			scope.selectedRight = "";
	  			//generate dataPoint nodes
	  			var count = 0;
	  			for (i=0;i<(data.length);i++){
	  				var newD = data[i];
	  				
	  				if (newD.county == "Los Angeles") {
		  				//TODO: refactor soon
		  				delete newD.agency_name;
		  				delete newD.org;
		  				delete newD.agency_contact;
		  				delete newD.namus_number;
			  			delete newD.ncmec_number;
			  			delete newD.org_contact;
			  			delete newD.aged_photo;
			  			delete newD.org_name;
		  				var a = {id:i, data:data[i], type:"point"};
		  				nodes.push(a);
		  				count++;
		  			}
	  			}
	  			startData();
	  		}
  		})	
  	}
  	return {
  		link: link,
  		restrict: 'E',
  		scope: {
  			data: '=',
  			allowcreate: '=',
  			initialmagnets: '='
  		},
  		templateUrl: 'magnet.html'
  	}
  });
})();
