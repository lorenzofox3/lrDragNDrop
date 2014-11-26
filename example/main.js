angular.module('app', ['lrDragNDrop'])
    .controller('safeCtrl', ['$scope', function (scope) {
        scope.collection = [
            {src: 'img/pict1.jpg', title: 'picture 1'},
            {src: 'img/pict2.jpg', title: 'picture 2'},
            {src: 'img/pict3.jpg', title: 'picture 3'}
        ];
        scope.collectionBis = [
            {src: 'img/pict4.jpg', title: 'picture 4'},
            {src: 'img/pict5.jpg', title: 'picture 5'},
            {src: 'img/pict6.jpg', title: 'picture 6'}
        ];
    }])
    .controller('nonSafeCtrl', ['$scope', function (scope) {
        scope.collection = [
            {src: 'img/pict1.jpg', title: 'picture 1'},
            {src: 'img/pict2.jpg', title: 'picture 2'},
            {src: 'img/pict3.jpg', title: 'picture 3'}
        ];
        scope.collectionBis = [
            {src: 'img/pict4.jpg', title: 'picture 4'},
            {src: 'img/pict5.jpg', title: 'picture 5'},
            {src: 'img/pict6.jpg', title: 'picture 6'}
        ];
        scope.dropSuccess = function(e, item, collection) {
            console.log('dropSuccess');
            console.log(e, item, collection);
        };
    }])
    .controller('reorderCtrl', ['$scope', function (scope) {
        scope.collection = [
            {src: 'img/pict1.jpg', title: 'picture 1'},
            {src: 'img/pict2.jpg', title: 'picture 2'},
            {src: 'img/pict3.jpg', title: 'picture 3'}
        ];
    }]);
