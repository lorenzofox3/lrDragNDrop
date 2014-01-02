angular.module('app', ['lrDragNDrop'])
    .controller('safeCtrl', ['$scope', function (scope) {
        scope.collection = [
            {src: 'pict1.jpg', title: 'picture 1'},
            {src: 'pict2.jpg', title: 'picture 2'},
            {src: 'pict3.jpg', title: 'picture 3'}
        ];
        scope.collectionBis = [
            {src: 'pict4.jpg', title: 'picture 4'},
            {src: 'pict5.jpg', title: 'picture 5'},
            {src: 'pict6.jpg', title: 'picture 6'}
        ];
    }])
    .controller('nonSafeCtrl', ['$scope', function (scope) {
        scope.collection = [
            {src: 'pict1.jpg', title: 'picture 1'},
            {src: 'pict2.jpg', title: 'picture 2'},
            {src: 'pict3.jpg', title: 'picture 3'}
        ];
        scope.collectionBis = [
            {src: 'pict4.jpg', title: 'picture 4'},
            {src: 'pict5.jpg', title: 'picture 5'},
            {src: 'pict6.jpg', title: 'picture 6'}
        ];
    }])
    .controller('reorderCtrl', ['$scope', function (scope) {
        scope.collection = [
            {src: 'pict1.jpg', title: 'picture 1'},
            {src: 'pict2.jpg', title: 'picture 2'},
            {src: 'pict3.jpg', title: 'picture 3'}
        ];
    }]);
