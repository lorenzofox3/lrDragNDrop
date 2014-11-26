"use strict";

describe('lrDragNDrop', function () {

    describe('lrDragStore', function () {

        var
            service,
            defaultItem = {id: 'test'},
            defaultCollection = [defaultItem];

        beforeEach(module('lrDragNDrop'));

        beforeEach(inject(function (lrDragStore) {
            service = lrDragStore;
        }));

        it('should store an item base on passed parameters and return it', function () {
            service.hold('validKey', defaultItem, defaultCollection, true);
            expect(service.get('validKey')).toBe(defaultItem);
        });

        it('should return null if there is nothing stored under a given namespace', function () {
            service.hold('validKey', defaultItem, defaultCollection, true);
            expect(service.get('whatever')).toBe(null);
        });

        it('should not modify the original collection in safe mode', function () {
            var item;
            service.hold('validKey', defaultItem, defaultCollection, true);
            item = service.get('validKey');
            expect(item).toBe(defaultItem);
            expect(defaultCollection).toEqual([defaultItem]);
        });

        it('should remove the item from original collection when it is in unsafe mode', function () {
            var item;
            service.hold('validKey', defaultItem, defaultCollection, false);
            item = service.get('validKey');
            expect(item).toBe(defaultItem);
            expect(defaultCollection).toEqual([]);
        });

        it('should clean the whole store', function () {
            service.hold('validKey', defaultItem, defaultCollection, true);
            expect(service.get('validKey')).toBe(defaultItem);
            expect(service.get('validKey')).toBe(defaultItem);
            service.clean();
            expect(service.get('validKey')).toBe(null);
        });

        it('should tells if service is currently holding item under namespace', function () {
            service.hold('validKey', defaultItem, defaultCollection, true);
            expect(service.isHolding('validKey')).toBe(true);
            expect(service.isHolding('whatever')).toBe(false);
        });

    });


    describe('directives', function () {

        var
            compile,
            scope;


        describe('src directives', function () {

            var storeMock = {
                    hold: angular.noop
                },
                items = [
                    {id: 1},
                    {id: 2},
                    {id: 3}
                ];

            beforeEach(module('lrDragNDrop', function ($provide) {
                $provide.factory('lrDragStore', function () {
                    return storeMock;
                });
            }));

            beforeEach(inject(function ($compile, $rootScope) {
                compile = $compile;
                scope = $rootScope;
                scope.items = items;
            }));

            it('should throw error if not used with ngRepeat', function () {
                try {
                    compile('<li lr-drag-src></li>')(scope);
                } catch (e) {
                    expect(e.message).toEqual('this directive must be used with ngRepeat directive');
                }
            });

            it('should add the draggable attribute to the element', function () {
                var
                    el, itemEl;
                spyOn(storeMock, 'hold');
                el = compile('<ul><li lr-drag-src="test" ng-repeat="item in items"></li></ul>')(scope);
                scope.$digest();
                expect(el.children().length).toBe(3);
                itemEl = $(el.children()[1]);
                expect(itemEl[0].draggable).toBe(true);
            });

            it('should store item on dragstart', function () {
                var
                    el, itemEl;
                spyOn(storeMock, 'hold');
                el = compile('<ul><li lr-drag-src="test" ng-repeat="item in items"></li></ul>')(scope);
                scope.$digest();
                expect(el.children().length).toBe(3);
                itemEl = $(el.children()[1]);
                itemEl.triggerHandler('dragstart');
                expect(storeMock.hold).toHaveBeenCalledWith('test', items[1], items, undefined);
            });

            it('should store item safely on dragstart', function () {
                var
                    el, itemEl;
                spyOn(storeMock, 'hold');
                el = compile('<ul><li lr-drag-src-safe="test" ng-repeat="item in items"></li></ul>')(scope);
                scope.$digest();
                expect(el.children().length).toBe(3);
                itemEl = $(el.children()[1]);
                itemEl.triggerHandler('dragstart');
                expect(storeMock.hold).toHaveBeenCalledWith('test', items[1], items, true);
            });
        });

        describe('target directive', function () {

            var items, itemsBis;

            beforeEach(module('lrDragNDrop'));

            beforeEach(inject(function ($compile, $rootScope) {
                compile = $compile;
                scope = $rootScope;
                items = [
                    {id: 1},
                    {id: 2},
                    {id: 3}
                ];
                itemsBis = [
                    {id: 4},
                    {id: 5},
                    {id: 6}
                ];
                scope.items = items;
                scope.itemsBis = itemsBis;
            }));

            it('should throw error if not used with ngRepeat', function () {
                try {
                    compile('<li lr-drop-target></li>')(scope);
                } catch (e) {
                    expect(e.message).toEqual('this directive must be used with ngRepeat directive');
                }
            });

            it('should drop the item at correct index without removing item', inject(function (lrDragStore) {
                var
                    el, itemEl;
                el = compile('<ul><li lr-drop-target="test" ng-repeat="item in itemsBis"></li></ul>')(scope);
                scope.$digest();
                expect(el.children().length).toBe(3);
                lrDragStore.hold('test', scope.items[0], scope.items, true);
                itemEl = $(el.children()[1]);
                itemEl.triggerHandler('drop');
                expect(el.children().length).toBe(4);
                expect(scope.items.length).toBe(3);
                expect(scope.itemsBis[1]).toBe(scope.items[0]);
            }));

            it('should drop the item at correct index and remove it from original source', inject(function (lrDragStore) {
                var
                    el, itemEl;
                el = compile('<ul><li lr-drop-target="test" ng-repeat="item in itemsBis"></li></ul>')(scope);
                scope.$digest();
                expect(el.children().length).toBe(3);
                lrDragStore.hold('test', scope.items[0], scope.items, false);
                itemEl = $(el.children()[1]);
                itemEl.triggerHandler('drop');
                expect(el.children().length).toBe(4);
                expect(scope.items.length).toBe(2);
                expect(scope.itemsBis[1].id).toBe(1);
            }));

            it('should drop the item at the correct index when source is target', inject(function (lrDragStore) {
                var
                    el, itemEl;
                el = compile('<ul><li lr-drag-src="test" lr-drop-target="test" ng-repeat="item in items"></li></ul>')(scope);
                scope.$digest();
                expect(el.children().length).toBe(3);
                lrDragStore.hold('test', scope.items[0], scope.items, false);
                itemEl = $(el.children()[2]);
                itemEl.triggerHandler('drop');
                expect(el.children().length).toBe(3);
                expect(scope.items.length).toBe(3);
                expect(scope.items[1].id).toBe(1);
            }));

            it('should drop the item at the correct index when source is target', inject(function (lrDragStore) {
                var
                    el, itemEl;
                el = compile('<ul><li lr-drag-src="test" lr-drop-target="test" ng-repeat="item in items"></li></ul>')(scope);
                scope.$digest();
                expect(el.children().length).toBe(3);
                lrDragStore.hold('test', scope.items[2], scope.items, false);
                itemEl = $(el.children()[1]);
                itemEl.triggerHandler('drop');
                expect(el.children().length).toBe(3);
                expect(scope.items.length).toBe(3);
                expect(scope.items[1].id).toBe(3);
            }));

        });
    });


});