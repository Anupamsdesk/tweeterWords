var app = angular.module('app',['ngRoute','btford.socket-io']);
app.constant('_', _);
app.constant('moment', moment);


/**** SERVICES ******/
//Socket.IO Service
app.factory('mySocket', function (socketFactory) {
  var mySocket = socketFactory();
  mySocket.forward('search-stream-response');
  mySocket.forward('tweet-error');
  return mySocket;
});

//Time Service for time based computations uses Moment.js
app.factory('TimeService', ['moment', function(moment){
  function getTimeOffsetMS(startTime){
    var diff =  moment.duration(moment()).asSeconds() - moment.duration(startTime).asSeconds(),
        timer = {
          min: 0, 
          sec:0
        };
      return{
        min:  parseInt(diff/60),
        sec: (diff%60)
      }
  }
  function getTimeOffsetM(startTime){
    return (getTimeOffsetMS(startTime)).min;
  }

  function getCurrentTime(){
    return new moment();
  }
  return{
    getTimeOffsetMS: getTimeOffsetMS,
    getTimeOffsetM: getTimeOffsetM,
    getCurrentTime: getCurrentTime
  };
}]);

//Tweet Service
app.factory('TweetService', ['mySocket', '$rootScope', 'TimeService', function(mySocket, $rootScope, TimeService){
  var socketListener = '', errorListener='', interval;
  function stopListening(){
    if (socketListener){
      socketListener();//close the listener if it is active
      mySocket.emit('stop-stream');
    }
    if (errorListener){
      errorListener();
    }
    if (interval) {
      clearInterval(interval);
    }
  };
  function startListening(timer, searchString, startTime ){
    mySocket.emit('search-stream', searchString);
    interval = setInterval(function(){
      var diff  =  TimeService.getTimeOffsetMS(startTime);
      timer.min =  diff.min;
      timer.sec =  diff.sec;
      $rootScope.$apply(timer);
    },1000);
    
    socketListener = 
      $rootScope.$on('socket:search-stream-response', function(ev, data){
        data.createdAt = moment(data.createdAt);
        $rootScope.$broadcast('newitem', data);
      });

    errorListener = 
      $rootScope.$on('socket:tweet-error', function(ev, data){
        $rootScope.$broadcast('tweeterror', data);
      });
  }
  return{
    startListening: startListening,
    stopListening: stopListening
  };
}]);

/**** CONTROLLERS ****/

// App Controller 
app.controller('appCtrl', ['$scope', '$rootScope','TweetService','TimeService',
    function($scope, $rootScope, TweetService, TimeService){
  
  function resetTweetStats(){
    $scope.totalTweets   = 0;
    $scope.averageTweets = 0;
    $scope.timer         = {min: 0, sec: 0};
    $scope.collection    = [];
    $scope.startTime     = TimeService.getCurrentTime();
    $scope.chart.data    = [];
    $scope.chart.height  = 200;
    $scope.$broadcast('dataupdated', $scope.chart.data);
    $scope.status.error = false;
    $scope.status.message = '';
  }

  $scope.searchString  = '';
  $scope.collection    = [];
  $scope.startTime     = '';
  $scope.chartData     = [];
  $scope.chart         = {};
  $scope.toggleBtnText = 'start';
  $scope.status        = {
    hasSearched: false,
    isSearching: false,
    error: false
  };
  
  resetTweetStats();

  $scope.clicked = function(){
    $scope.status.hasSearched = true;
    
    if ($scope.status.isSearching){
      TweetService.stopListening();
      $scope.status.isSearching = false;
      $scope.toggleBtnText = 'start';
    }
    else{
      $scope.status.isSearching = true;
      $scope.$broadcast('clear');
      resetTweetStats();
      TweetService.startListening($scope.timer, $scope.searchString, $scope.startTime);
      $scope.toggleBtnText = 'stop';
    }
  }

  $rootScope.$on('newitem', function(data){
    var iDiffInMins = TimeService.getTimeOffsetM($scope.startTime)
    $scope.totalTweets ++;

    while (iDiffInMins >= $scope.chart.data.length){
      $scope.chart.data.push(0)
    }
    $scope.$broadcast('dataupdated', $scope.chart.data);
    $scope.chart.data[iDiffInMins] += 1;
    
    iDiffInMins = iDiffInMins < 1 ? 1: iDiffInMins;
    $scope.averageTweets = ($scope.totalTweets===0) ? 0 : (parseFloat($scope.totalTweets / iDiffInMins)).toFixed(1);
  });

  $rootScope.$on('tweeterror',function(evt, data){
    $scope.status.error = true;
    $scope.status.message = data.msg;
  });
}]);


