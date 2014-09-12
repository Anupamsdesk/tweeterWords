console.log('app.js');
var app = angular.module('app',['ngRoute']);
app.constant('_', _);

app.controller('appCtrl', ['$scope', function($scope){
  console.log('App controller');
}]);