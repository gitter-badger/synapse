/*
 Copyright 2014 OpenMarket Ltd
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';

angular.module('RoomController')
.directive('tabComplete', ['$timeout', function ($timeout) {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            // console.log("event: " + event.which);
            var TAB = 9;
            var SHIFT = 16;
            var keypressCode = event.which;
            if (keypressCode === TAB) {
                if (!scope.tabCompleting) { // cache our starting text
                    scope.tabCompleteOriginal = element[0].value;
                    scope.tabCompleting = true;
                    scope.tabCompleteIndex = 0;
                }
                
                // loop in the right direction
                if (event.shiftKey) {
                    scope.tabCompleteIndex--;
                    if (scope.tabCompleteIndex < 0) {
                        // wrap to the last search match, and fix up to a real
                        // index value after we've matched
                        scope.tabCompleteIndex = Number.MAX_VALUE;
                    }
                }
                else {
                    scope.tabCompleteIndex++;
                }
                

                var searchIndex = 0;
                var targetIndex = scope.tabCompleteIndex;
                var text = scope.tabCompleteOriginal;
                
                // console.log("targetIndex: " + targetIndex + ", 
                // text=" + text);
                                    
                // FIXME: use the correct regexp to recognise userIDs --M
                //
                // XXX: I don't really know what the point of this is. You
                // WANT to match freeform text given you want to match display
                // names AND user IDs. Surely you just want to get the last
                // word out of the input text and that's that?
                // Am I missing something here? -- Kegan
                //
                // You're not missing anything - my point was that we should
                // explicitly define the syntax for user IDs /somewhere/.
                // Meanwhile as long as the delimeters are well defined, we
                // could just pick "the last word".  But to know what the
                // correct delimeters are, we probably do need a formal
                // syntax for user IDs to refer to... --Matthew
                
                var search = /@?([a-zA-Z0-9_\-:\.]+)$/.exec(text);

                if (targetIndex === 0) { // 0 is always the original text
                    element[0].value = text;                    
                    // Force angular to wake up and update the input ng-model 
                    // by firing up input event
                    angular.element(element[0]).triggerHandler('input');
                }
                else if (search && search[1]) {
                    // console.log("search found: " + search+" from "+text);
                    var expansion;
                    
                    // FIXME: could do better than linear search here
                    angular.forEach(scope.members, function(item, name) {
                        if (item.displayname && searchIndex < targetIndex) {
                            if (item.displayname.toLowerCase().indexOf(search[1].toLowerCase()) === 0) {
                                expansion = item.displayname;
                                searchIndex++;
                            }
                        }
                    });
                    if (searchIndex < targetIndex) { // then search raw mxids
                        angular.forEach(scope.members, function(item, name) {
                            if (searchIndex < targetIndex) {
                                // === 1 because mxids are @username
                                if (name.toLowerCase().indexOf(search[1].toLowerCase()) === 1) {
                                    expansion = name;
                                    searchIndex++;
                                }
                            }
                        });
                    }
                    
                    if (searchIndex === targetIndex || 
                            targetIndex === Number.MAX_VALUE) {
                        // xchat-style tab complete, add a colon if tab 
                        // completing at the start of the text
                        if (search[0].length === text.length)
                            expansion += ": ";
                        else
                            expansion += " ";
                        element[0].value = text.replace(/@?([a-zA-Z0-9_\-:\.]+)$/, expansion);
                        // cancel blink
                        element[0].className = "";     
                        if (targetIndex === Number.MAX_VALUE) {
                            // wrap the index around to the last index found
                            scope.tabCompleteIndex = searchIndex;
                            targetIndex = searchIndex;
                        }
                    }
                    else {
                        // console.log("wrapped!");
                        element[0].className = "blink"; // XXX: slightly naughty to bypass angular
                        $timeout(function() {
                             element[0].className = "";
                        }, 150);
                        element[0].value = text;
                        scope.tabCompleteIndex = 0;
                    }

                    // Force angular to wak up and update the input ng-model by
                    // firing up input event
                    angular.element(element[0]).triggerHandler('input');
                }
                else {
                    scope.tabCompleteIndex = 0;
                }
                // prevent the default TAB operation (typically focus shifting)
                event.preventDefault();
            }
            else if (keypressCode !== SHIFT && scope.tabCompleting) {
                scope.tabCompleting = false;
                scope.tabCompleteIndex = 0;
            }
        });

        scope.$on("$destroy", function() {
            element.unbind("keydown keypress");
        }); 
    };
}])
.directive('commandHistory', [ function() {
    return function (scope, element, attrs) {
        element.bind("keydown", function (event) {
            var keycodePressed = event.which;
            var UP_ARROW = 38;
            var DOWN_ARROW = 40;
            if (keycodePressed === UP_ARROW) {
                scope.history.goUp(event);
            }
            else if (keycodePressed === DOWN_ARROW) {
                scope.history.goDown(event);
            } 
        });

        scope.$on("$destroy", function() {
            element.unbind("keydown");
        });
    };
}])

// A directive to anchor the scroller position at the bottom when the browser is resizing.
// When the screen resizes, the bottom of the element remains the same, not the top.
.directive('keepScroll', ['$window', function($window) {
    return {
        link: function(scope, elem, attrs) {

            scope.windowHeight = $window.innerHeight;

            // Listen to window size change
            angular.element($window).bind('resize', function() {

                // If the scroller is scrolled to the bottom, there is nothing to do.
                // The browser will move it as expected
                if (elem.scrollTop() + elem.height() !== elem[0].scrollHeight) {
                    // Else, move the scroller position according to the window height change delta
                    var windowHeightDelta = $window.innerHeight - scope.windowHeight;
                    elem.scrollTop(elem.scrollTop() - windowHeightDelta);
                }

                // Store the new window height for the next screen size change
                scope.windowHeight = $window.innerHeight;
            });

            scope.$on("$destroy", function() {
                angular.element($window).unbind('resize');
            }); 
        }
    };
}]);

