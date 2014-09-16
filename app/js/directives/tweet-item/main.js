app.directive('tweetItem', function(){
	return{
		templateUrl: 'js/directives/tweet-item/template.html',
		scope: {
			model: '='
		}
	}
});