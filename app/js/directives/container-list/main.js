app.directive('containerList', ['$compile', function($compile){
	return {
		templateUrl: 'js/directives/container-list/template.html',
		restrict: 'A',
		replace: true,
		transclude: true,
		scope: {
			collection: '=',
			classNames: '@',
			show: '=',
			itemTemplate: '@'
		},
		controller: ['$scope', function(self){
		}],
		link: function(scope, el, attrs){
			var $container = el;//.find('.list');
			scope.$on("newitem", render)
			scope.$on('clear', clear);

			function clear(){
				el.find('li.list-item').remove();
			}

			function render(aScope, model){
				var toAppend = '';
				var template = 
				  "<li class='list-item'>"
						+ "<span %itemTemplate% model='model'></span>"
				+ "</li>";
				var find = '%itemTemplate%';
						var re = new RegExp(find, 'g');
						toAppend = template.replace(re, scope.itemTemplate);

				var ns = scope.$new();
					ns.model = model;

				$compile(toAppend)(ns, function(cloned, newscope){
					$container.append(cloned);
					var height = $container[0].scrollHeight;
					$container.scrollTop(height);
				});	
			}
			
		}
	};
}]);