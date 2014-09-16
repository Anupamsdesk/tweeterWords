 app.directive('barChart', function(){
    var chart = d3.custom.barChart();
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/js/directives/bar-chart/template.html',
        scope:{
            height: '=height',
            data: '=data'
        },
        link: function(scope, element, attrs) {
            var chartEl = d3.select(element[0]);
            scope.$on('dataupdated', function (scope, newVal) {
                chartEl.datum(newVal).call(chart);
            });
            scope.$watch('height', function(d, i){
                chartEl.call(chart.height(scope.height));
            });
        }
    }
});