/*jslint node: true, unparam: true, regexp: true */
'use strict';

/**
 * @file angucomplete
 * @fileOverview angucomplete
 */

/**
 * @namespace angucomplete
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('angucomplete', ['$timeout', '$location', '$templateCache', '$parse', '$http', '$compile', '$q', '$sce', 'Tools', function ($timeout, $location, $templateCache, $parse, $http, $compile, $q, $sce, Tools) {
    var getTemplate = function (index) {
      var templateId = ['views/directives/d_angucomplete.html', 'views/directives/d_angucomplete_box.html'], deferred, template;
      deferred = $q.defer();
      template = $templateCache.get(templateId[index]);
      if (template) {
        deferred.resolve(template);
      } else {
        $http.get(templateId[index], {cache: true})
          .success(function (html) {
            $templateCache.put(templateId[index], html);
            deferred.resolve($templateCache.get(templateId[index]));
          })
          .error(function (result) {
            deferred.reject(result);
          });
      }
      return deferred.promise;
    };
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        id: "@",
        placeholder: "@",
        model: "=",
        modelObject: "=?",
        modelType: "@",
        selectedObjectId: "@",
        url: "@",
        dataField: "@",
        titleField: "@",
        selectedField: "@",
        descriptionField: "@",
        imageField: "@",
        inputClass: "@",
        userPause: "@pause",
        localData: "=?",
        searchFields: "@",
        searchFieldsWithoutSpec: "@",
        searchStr: "=?",
        matchClass: "@",
        showAsBox: "=",
        boxItems: "=?",
        multiple: "=",
        dropDown: "=?",
        tabindex: "@",
        inputAllData: "=?",
        labelName: "@",
        labelClass: "@",
        disabled: '=?',
        menuLeft: '=?',
        onDeleteBoxItem: '=?',
        onSelectItem: '=?',
        recordUrl: '@'
      },
      templateUrl: 'views/directives/d_root_element.html',
      link: function ($scope, elem, attrs) {
        var extractValue, isNewSearchNeeded, stackTimeout, addInputData;
        $scope.lastSearchTerm = null;
        $scope.currentIndex = null;
        $scope.justChanged = false;
        $scope.searchTimer = null;
        $scope.searching = false;
        $scope.pause = 500;
        $scope.minLengthForSearch = 1;//$scope.minLengthForSearch || 3;
        $scope.startServerSearch = false;
        $scope.existsItemInArray = Tools.existsItemInArray;
        $scope.results = [];
        $scope.dropDownMenuLeft = $scope.menuLeft || false;
        $scope.dropDownMenuRight = !$scope.menuLeft;
        $scope.focusInput = true;
        $scope.inProcess = false;
        $scope.loading = {offset: 0, limit: 10};
        $scope.invalid = false;
        $scope.clickOnNextRows = false;
        $scope.searchStrIsChanging = false;
        $scope.modelIsChanging = false;

        // set template
        getTemplate($scope.showAsBox ? 1 : 0).then(function (template) {
          elem.html(template).show();
          $compile(elem.contents())($scope);
        });

        /**
         * @memberof angucomplete
         * @method
         * @name dropDownClick
         * @description click on item of array autocomplete list
         * @param obj {Object} item of dropDown list
         * @returns void
         */
        $scope.dropDownClick = function (obj) {
          if (obj.onClick) {
            obj.onClick(obj);
          } else {
            // searchStr change the model
            $scope.searchStrIsChanging = true;
            $scope.searchStr = obj[$scope.selectedField || $scope.titleField];
            if ($scope.modelObject !== 'undefined') {
              $scope.modelObject = obj;
            }
          }
          if ($scope.onSelectItem) {
            $timeout(function () {
              $scope.onSelectItem(Object.create(obj));
            });
          }
        };

        /**
         * @memberof angucomplete
         * @method
         * @name clearAutocomplete
         * @description clear autocomplete search list
         * @returns void
         */
        $scope.clearAutocomplete = function () {
          $scope.showDropdown = false;
          $scope.results = [];
        };

        if ($scope.userPause) {
          $scope.pause = $scope.userPause;
        }

        extractValue = function (obj, key) {
          var value;
          if (key) {
            value = obj[key];
          } else {
            value = obj;
          }
          return value;
        };

        isNewSearchNeeded = function (newTerm, oldTerm) {
          return newTerm.length >= parseInt($scope.minLengthForSearch, 10) && ($scope.localData ? newTerm !== oldTerm : $scope.startServerSearch); // newTerm !== oldTerm && ($scope.startServerSearch || $scope.localData);
        };

        $scope.processResults = function (responseData, str, inc) {
          var i, t, titleCode, titleFields, description, image, text, re, strPart, resultRow;
          if (responseData && responseData.length > 0) {
            if (!inc) {
              $scope.results = [];
            }
            titleFields = [];
            if ($scope.titleField && $scope.titleField !== "") {
              titleFields = $scope.titleField.split(",");
            }

            for (i = 0; i < responseData.length; i += 1) {
              // Get title variables
              titleCode = "";

              for (t = 0; t < titleFields.length; t += 1) {
                if (t > 0) {
                  titleCode = titleCode + " + ' ' + ";
                }
                titleCode = titleCode + responseData[i][titleFields[t]];
              }

              description = "";
              if ($scope.descriptionField) {
                description = extractValue(responseData[i], $scope.descriptionField);
              }

              image = "";
              if ($scope.imageField) {
                image = extractValue(responseData[i], $scope.imageField);
              }

              text = titleCode;
              if ($scope.matchClass) {
                re = new RegExp(str, 'i');
                strPart = text.match(re)[0];
                text = $sce.trustAsHtml(text.replace(re, '<span class="' + $scope.matchClass + '">' + strPart + '</span>'));
              }

              resultRow = {
                title: text,
                description: description,
                image: image,
                originalObject: responseData[i]
              };

              //$scope.results[$scope.results.length] = resultRow;
              $scope.results.push(resultRow);
            }


          } else {
            if (!inc) {
              $scope.results = [];
            }
          }
        };

        $scope.searchTimerComplete = function (str) {
          // Begin the search
          var i, s, searchFields, matches, match, exist, searchFieldsWithoutSpec;
          if (str.length >= parseInt($scope.minLengthForSearch, 10)) {
            $scope.showDropdown = true;
            if ($scope.localData) {
              //$scope.showDropdown = true;
              searchFields = $scope.searchFields.split(",");

              matches = [];

              for (i = 0; i < $scope.localData.length; i += 1) {
                match = false;

                for (s = 0; s < searchFields.length; s += 1) {
                  exist = false;
                  if ($scope.localData && $scope.localData[i][searchFields[s]]) {
                    exist = ($scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0); // MB
                  }
                  match = match || exist; // MB
                }

                // for search without spec
                if ($scope.searchFieldsWithoutSpec) {
                  searchFieldsWithoutSpec = $scope.searchFieldsWithoutSpec.split(",");
                  for (s = 0; s < searchFieldsWithoutSpec.length; s += 1) {
                    exist = false;
                    if ($scope.localData && $scope.localData[i][searchFieldsWithoutSpec[s]]) {
                      exist = ($scope.localData[i][searchFieldsWithoutSpec[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0); // MB
                    }
                    match = match || exist; // MB
                  }
                }

                if (match) {
                  matches[matches.length] = $scope.localData[i];
                }
              }

              $scope.searching = false;
              $scope.processResults(matches, str);
              $scope.$apply();


            } else {
              $scope.inProcess = true;
              $scope.loadServerData(str);
            }
          }

        };

        $scope.loadServerData = function (str, inc) {
          return $http.get($scope.url + str + '?' + Tools.objectToQueryString({offset: $scope.loading.offset, limit: $scope.loading.limit}), {})
            .success(function (responseData, status, headers, config) {
              $scope.searching = false;
              var data = extractValue(responseData, $scope.dataField);
              $scope.processResults(data, str, inc);
              $scope.inProcess = false;
              $scope.showDropdown = true;
            })
            .error(function (data, status, headers, config) {
              $scope.inProcess = false;
            });
        };

        $scope.hoverRow = function (index) {
          $scope.currentIndex = index;
        };

        $scope.keyPressed = function (event) {
          if (event.which === 13) {
            if ($scope.localData || (!$scope.localData && $scope.showDropdown)) {
              // set input width
              $scope.modifyInput();
            }
          }
          if (!(event.which === 38 || event.which === 40 || event.which === 13) || (event.which === 13 && !$scope.localData)) {
            // for server search
            if (event.which === 13) {
              if ($scope.showDropdown) {
                event.preventDefault();
              } else {
                $scope.startServerSearch = true;
              }
            }
            if (!$scope.searchStr || $scope.searchStr === "") {
              $scope.showDropdown = false;
              $scope.lastSearchTerm = null;
            } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
              $scope.lastSearchTerm = $scope.searchStr;
              //$scope.showDropdown = true;
              $scope.currentIndex = -1;
              $scope.results = [];
              $scope.startServerSearch = false;

              if ($scope.searchTimer) {
                clearTimeout($scope.searchTimer);
              }

              $scope.searching = true;

              $scope.searchTimer = setTimeout(function () {
                $scope.searchTimerComplete($scope.searchStr);
              }, $scope.pause);
            }
          } else {
            event.preventDefault();
          }
          $scope.startServerSearch = false;
        };

        $scope.selectResult = function (result) {
          // clear action onBlur for auto selected
          $timeout.cancel(stackTimeout);
          if ($scope.matchClass) {
            result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
          }
          // searchStr change the model
          $scope.searchStrIsChanging = true;
          $scope.searchStr = $scope.lastSearchTerm = $scope.selectedField ? result.originalObject[$scope.selectedField] : result.title;
          $scope.currentObject = result;
          $scope.showDropdown = false;
          $scope.results = [];
          // MB
          if ($scope.model !== 'undefined') {
            $scope.model = $scope.currentObject.originalObject[$scope.selectedObjectId];
          }
          if ($scope.modelObject !== 'undefined') {
            $scope.modelObject = $scope.currentObject.originalObject;
          }
          if ($scope.showAsBox) {
            $scope.searchStr = '';
          }
          // MB
          $scope.addItem($scope.currentObject.originalObject);
          if ($scope.onSelectItem) {
            $scope.onSelectItem(Object.create($scope.currentObject.originalObject));
          }
          $scope.currentObject = {};
        };

        // MB
        $scope.addItem = function (obj) {
          var exist = false, i, item;
          if (obj && $scope.boxItems) {
            for (i = 0; i < $scope.boxItems.length; i += 1) {
              item = $scope.boxItems[i];
              if (item.id === obj.id) {
                exist = true;
              }
            }
            if (!exist) {
              $scope.boxItems.push(obj);
            }
          }
        };

        // MB
        $scope.init = function () {
          // Set default value for input
          if (!$scope.showAsBox && !$scope.multiple && !$scope.searchStr && $scope.localData) {
            $scope.searchStr = Tools.getItemFromArray($scope.model, $scope.selectedObjectId, $scope.localData, $scope.selectedField || $scope.titleField);
          }
        };

        // MB
        $scope.clearModel =  function () {
          $scope.model = '';
          $scope.modelObject = '';
        };

        // MB
        $scope.onBlur = function () {
          $timeout(function () {
            if (!$scope.clickOnNextRows) {
              $scope.focusInput = false;
              //$scope.showDropdown = false;
            }
            $scope.clickOnNextRows = false;
            $scope.testValidation();
          }, 400);
          /*$timeout(function () {
           $scope.testValidation();
           }, 400);*/
        };

        $scope.testValidation = function () {
          if ($('#' + $scope.id + '_value').val() && (!$scope.boxItems || ($scope.boxItems && $scope.boxItems.length === 0))) {
            $scope.invalid = true;
          } else {
            $scope.invalid = false;
          }
        };

        // MB
        $scope.onNewRecordClick = function () {
          var searchVal = $scope.searchStr;
          $timeout(function () {
            $scope.focusInput = false;
          }, 200);
          if (!searchVal) {
            return;
          }
          stackTimeout = $timeout(function () {
            addInputData(null, false);
          }, 200);
        };

        // MB
        $scope.onClickSearch = function (event) {
          // as key press in input
          event.which = 13;
          $scope.keyPressed(event);
        };

        // MB
        $scope.setFocus = function (arg) {
          $timeout(function () {
            $scope.focusInput = arg;
          }, 200);
        };

        // MB
        $scope.onDelete = function (index) {
          $scope.boxItems.splice(index, 1);
          $scope.searchStr = ''; // MB 14.11.2014
          $scope.lastSearchTerm = ''; // MB 14.11.2014
          if ($scope.onDeleteBoxItem) {
            $scope.onDeleteBoxItem(index);
          }
        };

        // Run
        $scope.init();
        //},

        //link: function ($scope, elem, attrs, ctrl) {
        elem.bind("keyup", function (event) {
          if (event.which === 40) {
            if (($scope.currentIndex + 1) < $scope.results.length) {
              $scope.currentIndex += 1;
              $scope.$apply();
              event.preventDefault();
              event.stopPropagation();
            }
            $scope.$apply();
          } else if (event.which === 38) {
            if ($scope.currentIndex >= 0) { // 0 for new record item without results
              $scope.currentIndex -= 1;
              $scope.$apply();
              event.preventDefault();
              event.stopPropagation();
            }
          } else if (event.which === 13) {
            if ($scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
              $scope.selectResult($scope.results[$scope.currentIndex]);
              $scope.$apply();
              event.preventDefault();
              event.stopPropagation();
            } else {
              // add input data if key not fount in search data
              if ($scope.localData || (!$scope.localData && $scope.showDropdown)) {
                addInputData(event, true);
              }
            }

          } else if (event.which === 27) {
            $scope.results = [];
            $scope.showDropdown = false;
            $scope.loading = {offset: 0, limit: 10};
            $scope.$apply();
          } else if (event.which === 8) {
            $scope.currentObject = null;
            $scope.$apply();
          }
        });

        // MB
        addInputData = function (event, setFocus) {
          var searchVal = $scope.searchStr, ran = Math.random().toString().substring(2);
          if ($scope.inputAllData && $scope.showAsBox) {
            if (!$scope.multiple) {
              $scope.boxItems = [];
              if (setFocus) {
                $('#' + $scope.id + '_angc').focus();
              }
            }
            if (searchVal) {
              $scope.addItem({id: 'id_' + ran, name: searchVal, new: true});
            }
            $scope.showDropdown = false;
          }
          if ($scope.showAsBox) {
            $scope.searchStr = '';
          }
          $scope.lastSearchTerm = '';

          if (!$scope.localData) {
            $scope.results = [];
          }
          $scope.$apply();
          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }
        };

        $scope.nextData = function (event) {
          $scope.clickOnNextRows = true;
          $scope.loading.offset += $scope.loading.limit;
          $scope.inProcessNextPage = true;
          $scope.loadServerData($scope.searchStr, true).then(function () {
            $scope.inProcessNextPage = false;
          });
        };

        $scope.onChangeInput = function () {
          $scope.showDropdown = $scope.showDropdown ? false : $scope.showDropdown;
          $scope.invalid = false;
        };

        $scope.modifyInput = function () {
          var newWidth, boxsWidth = 0, paddingAndBorder = 26, pom = 2, corection = 3;
          $timeout(function () {
            $('#' + $scope.id + '_value').css('width', '100');
            $('#' + $scope.id + '_angc .n-label-autocomplete').each(function () {
              boxsWidth += parseInt($(this).outerWidth(true), 10) + pom;
            });
            newWidth = parseInt($('#' + $scope.id + '_angc').css('width'), 10) - boxsWidth - paddingAndBorder - corection;
            $('#' + $scope.id + '_value').css('width', newWidth).focus();
          }, 300);
        };

        $scope.showNewRecord = function () {
          return $scope.inputAllData && $scope.results.every(function (el) { return $scope.searchStr !== el.title; });
        };

        $scope.openRecord = function (obj) {
          if (obj.id) {
            $location.path($scope.recordUrl + obj.id);
          }
        };

        // MB
        $scope.initAfterCancelChanges = function () {
          // Set default value for input
          if (!$scope.showAsBox && !$scope.multiple && $scope.localData) {
            $scope.searchStrIsChanging = true;
            $scope.modelIsChanging = true;
            $scope.searchStr = Tools.getItemFromArray($scope.model, $scope.selectedObjectId, $scope.localData, $scope.selectedField || $scope.titleField);
          }
        };

        // Watchers
        // MB
        /*$scope.$watch('currentObject', function (newVal, oldVal) {
         if (newVal !== oldVal) {
         if (newVal) {
         $scope.addItem(newVal.originalObject);
         $scope.currentObject = {};
         }
         }
         }, true);*/

        $scope.$watch('results', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.modifyInput();
          }
        }, true);

        $scope.$watch('model', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            if (!$scope.showAsBox && !$scope.searchStrIsChanging) {
              $scope.initAfterCancelChanges();
            }
            $timeout(function () {
              $scope.modelIsChanging = false;
            }, 1000);
          }
        }, true);

        $scope.$watch('searchStr', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            if (!$scope.showAsBox && !$scope.multiple && $scope.localData && !$scope.modelIsChanging) {
              if (newVal) {
                $scope.model = Tools.getItemFromArray($scope.searchStr, $scope.selectedField || $scope.titleField, $scope.localData, $scope.selectedObjectId);
              } else {
                $scope.model = null;
              }
            }
            $timeout(function () {
              $scope.searchStrIsChanging = false;
            }, 1000);
          }
        }, true);
        // Run
      }
    };
  }]);

