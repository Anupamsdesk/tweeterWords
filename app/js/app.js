console.log('app.js');
var app = angular.module('app',['ngRoute']);
app.constant('_', _);

app.controller('appCtrl', ['$scope', function($scope){
  console.log('App controller');
}]);


OAuth.initialize('YOURPUBLICKEY');

  
OAuth.popup('twitter')
.done(function(result) {
  //use result.access_token in your API request 
  //or use result.get|post|put|del|patch|me methods (see below)
  console.log(result);
})
.fail(function (err) {
  //handle error with err
  console.log(err);
});