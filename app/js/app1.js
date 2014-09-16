console.log('app.js');
var app = angular.module('app',['ngRoute','btford.socket-io']);
app.constant('_', _);
app.constant('moment', moment);


app.factory('mySocket', function (socketFactory) {
  var mySocket = socketFactory();
  mySocket.forward('search-stream-response');
  return mySocket;
});




app.controller('appCtrl', ['$scope','TService', 'moment', 'mySocket', 
		function($scope, TService, moment, mySocket){
	$scope.socketListener = '';
  $scope.searchString = '';
  $scope.collection = [];
  $scope.startTime = '';
  $scope.chartData = [];
  $scope.chart = {};
  $scope.status = {
  	hasSearched: false,
  	isSearching: false
  };
  $scope.toggleBtnText = 'start';

  var interval;
  resetTweetStats();

   function stopListening(){
  	if ($scope.socketListener){
  		$scope.socketListener();//close
  		mySocket.emit('stop-stream');
  	}
  	if (interval) {
  		clearInterval(interval);
  	}
  };


  function resetTweetStats(){
  	$scope.totalTweets   = 0;
  	$scope.averageTweets = 0;
  	$scope.timer = {min: 0, sec: 0};
  	$scope.collection    = [];
  	$scope.startTime     = new moment();
  	$scope.$broadcast('dataupdated', $scope.chart.data);
  	$scope.chart.data    = [];
  	$scope.chart.height  = 200;
  }

  $scope.clicked = function(){
  	if ($scope.status.isSearching){
  		stopListening();
  		$scope.status.isSearching = false;
  		$scope.toggleBtnText = 'start';
  	}else{
  		$scope.status.isSearching = true;
  		startListening();
  		$scope.toggleBtnText = 'stop';
  	}
  }

  function startListening(){
  	$scope.status.hasSearched = true;
  	//$scope.stopListening();
  	$scope.$broadcast('clear');
  	resetTweetStats();
  	mySocket.emit('search-stream', $scope.searchString);
  	interval = setInterval(function(){
	  	var diff =  moment.duration(moment()).asSeconds() - 
		  		moment.duration($scope.startTime).asSeconds();
		  $scope.timer.min =  parseInt(diff/60);
		  $scope.timer.sec = (diff%60);
		  $scope.$apply('timer');
	  },1000);
	  $scope.socketListener = 
	  	$scope.$on('socket:search-stream-response', function(ev, data){
	  		data.createdAt = moment(data.createdAt);
	  		$scope.$broadcast('newitem', data);
	  		$scope.totalTweets ++;
	  		var now = moment();
		  	var diffInMins = moment.duration(now).asMinutes() - 
		  		moment.duration($scope.startTime).asMinutes();
		  	var iDiffInMins = Math.floor(diffInMins);
		  	while (iDiffInMins >= $scope.chart.data.length){
		  		$scope.chart.data.push(0)
		  	}
		  	$scope.$broadcast('dataupdated', $scope.chart.data);
		  	$scope.chart.data[iDiffInMins] += 1;
		  	if (diffInMins<1) diffInMins = 1;	  	
		  	$scope.averageTweets = ($scope.totalTweets===0) ? 0 : (parseFloat($scope.totalTweets / diffInMins)).toFixed(1);
	  	});
  }
}]);


app.service('TService', ['$http', function($http){
	return{
		open: function(searchString){
			$http.get('/twitterstream', {params: {'search': searchString}}).
				success(function(data, status){}).error(function(data, status){});
		}
	};
}]);


