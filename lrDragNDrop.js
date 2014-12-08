(function (ng) {
    'use strict';

    function isJqueryEventDataTransfer(){
        return window.jQuery && (-1 == window.jQuery.event.props.indexOf('dataTransfer'));
    }

    if (isJqueryEventDataTransfer()) {
        window.jQuery.event.props.push('dataTransfer');
    }

    var module = ng.module('lrDragNDrop', []);

    module.service('lrDragStore', ['$document', function (document) {

        var store = {};

        this.hold = function hold(key, item, collectionFrom, safe) {
            store[key] = {
                item: item,
                collection: collectionFrom,
                safe: safe === true
            }
        };

        this.get = function (namespace) {
            var
                modelItem = store[namespace], itemIndex;

            if (modelItem) {
                itemIndex = modelItem.collection.indexOf(modelItem.item);
                return modelItem.safe === true ? modelItem.item : modelItem.collection.splice(itemIndex, 1)[0];
            } else {
                return null;
            }
        };

        this.clean = function clean() {
            store = {};
        };

        this.isHolding = function (namespace) {
            return store[namespace] !== undefined;
        };

        document.bind('dragend', this.clean);
    }]);

    module.service('lrDragHelper', function () {
        var th = this;

        th.parseRepeater = function(scope, attr) {
            var
                repeatExpression = attr.ngRepeat,
                match;

            if (!repeatExpression) {
                throw Error('this directive must be used with ngRepeat directive');
            }
            match = repeatExpression.match(/^(.*\sin).(\S*)/);
            if (!match) {
                throw Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" +
                    repeatExpression + "'.");
            }

            return scope.$eval(match[2]);
        };

        th.lrDragSrcDirective = function(store, safe) {
            return function compileFunc(el, iattr) {
                iattr.$set('draggable', true);
                return function linkFunc(scope, element, attr) {
                    var
                        collection,
                        key = (safe === true ? attr.lrDragSrcSafe : attr.lrDragSrc ) || 'temp';

                    if(attr.lrDragData) {
                        scope.$watch(attr.lrDragData, function (newValue) {
                            collection = newValue;
                        });
                    } else {
                        collection = th.parseRepeater(scope, attr);
                    }

                    element.bind('dragstart', function (evt) {
                        store.hold(key, collection[scope.$index], collection, safe);
                        if(angular.isDefined(evt.dataTransfer)) {
                            evt.dataTransfer.setData('text/html', null); //FF/jQuery fix
                        }
                    });
                }
            }
        }
    });

    module.directive('lrDragSrc', ['lrDragStore', 'lrDragHelper', function (store, dragHelper) {
        return{
            compile: dragHelper.lrDragSrcDirective(store)
        };
    }]);

    module.directive('lrDragSrcSafe', ['lrDragStore', 'lrDragHelper', function (store, dragHelper) {
        return{
            compile: dragHelper.lrDragSrcDirective(store, true)
        };
    }]);

    module.directive('lrDropTarget', ['lrDragStore', 'lrDragHelper', '$parse', function (store, dragHelper, $parse) {
        return {
            link: function (scope, element, attr) {

                var
                    collection,
                    key = attr.lrDropTarget || 'temp',
                    classCache = null;

                function isAfter(x, y) {
                    //check if below or over the diagonal of the box element
                    return (element[0].offsetHeight - x * element[0].offsetHeight / element[0].offsetWidth) < y;
                }

                function resetStyle() {
                    if (classCache !== null) {
                        element.removeClass(classCache);
                        classCache = null;
                    }
                }

                if(attr.lrDragData) {
                    scope.$watch(attr.lrDragData, function (newValue) {
                        collection = newValue;
                    });
                } else {
                    collection = dragHelper.parseRepeater(scope, attr);
                }

                element.bind('drop', function (evt) {
                    var
                        collectionCopy = ng.copy(collection),
                        item = store.get(key),
                        dropIndex, i, l;
                    if (item !== null) {
                        dropIndex = scope.$index;
                        dropIndex = isAfter(evt.offsetX, evt.offsetY) ? dropIndex + 1 : dropIndex;
                        //srcCollection=targetCollection => we may need to apply a correction
                        if (collectionCopy.length > collection.length) {
                            for (i = 0, l = Math.min(dropIndex, collection.length - 1); i <= l; i++) {
                                if (!ng.equals(collectionCopy[i], collection[i])) {
                                    dropIndex = dropIndex - 1;
                                    break;
                                }
                            }
                        }
                        scope.$apply(function () {
                            collection.splice(dropIndex, 0, item);
                            var fn = $parse(attr.lrDropSuccess) || ng.noop;
                            fn(scope, {e: evt, item: item, collection: collection});
                        });
                        evt.preventDefault();
                        resetStyle();
                        store.clean();
                    }
                });

                element.bind('dragleave', resetStyle);

                element.bind('dragover', function (evt) {
                    var className;
                    if (store.isHolding(key)) {
                        className = isAfter(evt.offsetX, evt.offsetY) ? 'lr-drop-target-after' : 'lr-drop-target-before';
                        if (classCache !== className && classCache !== null) {
                            element.removeClass(classCache);
                        }
                        if (classCache !== className) {
                            element.addClass(className);
                        }
                        classCache = className;
                    }
                    evt.preventDefault();
                });
            }
        };
    }]);
})(angular);