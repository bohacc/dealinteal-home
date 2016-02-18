/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Person
 * @fileOverview PersonCtrl
 */

/**
 * @namespace PersonCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('PersonCtrl', ['$scope', '$location', '$translatePartialLoader', '$translate', '$timeout', 'PeopleService', 'PageAncestor', 'CountriesService', 'LogData', 'Tools', 'Constants', 'DatepickerFactory', 'MessengerService', 'FilesService', 'DateService', 'initialData', 'AttachmentsService',
    function ($scope, $location, $translatePartialLoader, $translate, $timeout, PeopleService, PageAncestor, CountriesService, LogData, Tools, Constants, DatepickerFactory, MessengerService, FilesService, DateService, initialData, AttachmentsService) {
      $translatePartialLoader.addPart('person');
      $translate.refresh();

      $scope.person = initialData.person;
      if ($scope.person.id) {
        $scope.person.company = ($scope.person.companies_id ? [{
          id: $scope.person.companies_id,
          name: $scope.person.company_name
        }] : []);
        $scope.person.positionBox = ($scope.person.position_id ? [{
          id: $scope.person.position_id,
          name: $scope.person.position
        }] : []);
        $scope.person.roleBox = ($scope.person.role_id ? [{id: $scope.person.role_id, name: $scope.person.role}] : []);
      } else {
        $scope.person.company = [];
        $scope.person.positionBox = [];
        $scope.person.roleBox = [];
      }
      $scope.showOnPage = '';
      $scope.pageAncestor = {};
      $scope.pills = [
        {
          name: 'INTRO', hide: function () {
          return true;
        }
        },
        {name: 'PERSONAL'},
        {name: 'CONTACTS'},
        {name: 'COMPANY'},
        {
          name: 'NOTES', hide: function () {
          return true;
        }
        },
        {
          name: 'RESPONSIBILITY', hide: function () {
          return !$scope.person.teamMember;
        }
        },
        {name: 'AGENDA'}
      ];
      $scope.activePillsIndex = 1;
      $scope.pills_contacts = [
        {name: 'BUSINESS'},
        {name: 'HOME'},
        {name: 'OTHER'}
      ];
      $scope.localDataCountries = initialData.countries;
      $scope.validateZip = Tools.validateZip;
      $scope.validatePhone = Tools.validatePhone;
      $scope.validateEmail = Tools.validateEmail;
      $scope.loadDataForAgendaList = PeopleService.listForAgenda;
      $scope.pictureFile = {};
      $scope.isPictureChange = false;
      $scope.inProcess = false;
      $scope.uploadPictureConfig = {};
      $scope.dataForAgenda = {};

      /**
       * @memberof PersonCtrl
       * @method
       * @name uploadPicture
       * @description upload picture
       * @returns void
       */
      $scope.uploadPicture = function () {
        FilesService.uploadFile($scope.pictureFile, $scope.uploadPictureConfig);
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name initButtons
       * @description creates action buttons
       * @returns action buttons
       */
      $scope.initButtons = function () {
        var save = {};
        $scope.actionButtons = [
          {
            name: 'DELETE',
            dropDown: [{
              name: 'DELETE_THIS_PERSON', onClick: $scope.del, disabled: function () {
                return !$scope.person.id;
              }
            }],
            disabled: !$scope.person.id
          },
          {
            name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () {
            return !$scope.pageAncestor.log.changes.isChanged;
          }
          }
        ];
        if ($scope.person.id) {
          save = {
            name: 'SAVE', onClick: $scope.put, disabled: function () {
              return $scope.inProcess;
            }
          };
        } else {
          save = {
            name: 'SAVE', onClick: $scope.post, disabled: function () {
              return $scope.inProcess;
            }
          };
        }
        $scope.actionButtons.push(save);
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name put
       * @description put current Person
       * @returns void
       */
      $scope.put = function () {
        $scope.person.company_name = $scope.person.company[0] ? $scope.person.company[0].name : '';
        if ($scope.verifyForm()) {
          $scope.person.birthday = DateService.setDateAsUTC0($scope.person.birthday);
          $scope.person.anniversary = DateService.setDateAsUTC0($scope.person.anniversary);
          $scope.pageAncestor.put(function () {
            return PeopleService.put($scope.person).then(function (promise) {
              $scope.person.companies_id = promise.data.companies_id;
              $scope.person.position_id = promise.data.position_id;
              $scope.person.role_id = promise.data.role_id;
              $timeout(function () {
                var logData;
                logData = LogData.getInstance();
                logData.clear();
              }, 400);
              return promise;
            });
          });
        }
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name post
       * @description post current Person
       * @returns void
       */
      $scope.post = function () {
        $scope.person.company_name = $scope.person.company[0] ? $scope.person.company[0].name : '';
        if ($scope.verifyForm()) {
          $scope.person.birthday = DateService.setDateAsUTC0($scope.person.birthday);
          $scope.person.anniversary = DateService.setDateAsUTC0($scope.person.anniversary);
          $scope.pageAncestor.post(function () {
            return PeopleService.post($scope.person).then(function (promise) {
              if (promise.data.id) {
                $location.path(($scope.person.teamMember ? '/team-member/' : '/person/') + promise.data.id);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name del
       * @description delete current Person
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return PeopleService.del($scope.person).then(function (promise) {
            if (promise.data.id) {
              $location.path('/person/' + promise.data.id);
            } else {
              $location.path('/people');
            }
            return promise;
          });
        });
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name verifyForm
       * @description validation form data
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l, tmp;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        if ($scope.person.home_addr_zip && !Tools.validateZip($scope.person.home_addr_zip)) {
          result = false;
          verifyMessages.push({message: 'ZIP'});
        }
        if ($scope.person.email && !Tools.validateEmail($scope.person.email)) {
          result = false;
          verifyMessages.push({message: 'EMAIL'});
        }
        if ($scope.person.email2 && !Tools.validateEmail($scope.person.email2)) {
          result = false;
          verifyMessages.push({message: 'EMAIL2'});
        }
        if ($scope.person.mobile_phone && !Tools.validatePhone($scope.person.mobile_phone)) {
          result = false;
          verifyMessages.push({message: 'MOBILE_PHONE'});
        }
        if ($scope.person.business_phone && !Tools.validatePhone($scope.person.business_phone)) {
          result = false;
          verifyMessages.push({message: 'BUSINESS_PHONE'});
        }
        if ($scope.person.home_phone && !Tools.validatePhone($scope.person.home_phone)) {
          result = false;
          verifyMessages.push({message: 'HOME_PHONE'});
        }
        if ($scope.person.assistant_phone && !Tools.validatePhone($scope.person.assistant_phone)) {
          result = false;
          verifyMessages.push({message: 'COMPANY_PHONE'});
        }
        if ($scope.person.other_phone && !Tools.validatePhone($scope.person.other_phone)) {
          result = false;
          verifyMessages.push({message: 'OTHER_PHONE'});
        }
        if ($scope.person.fax && !Tools.validatePhone($scope.person.fax)) {
          result = false;
          verifyMessages.push({message: 'FAX'});
        }
        tmp = $('#BIRTHDAY').val();
        if (tmp && !Tools.validateDate(tmp, null)) {
          result = false;
          verifyMessages.push({message: 'BIRTHDAY'});
        }
        tmp = $('#ANNIVERSARY').val();
        if (tmp && !Tools.validateDate(tmp, null)) {
          result = false;
          verifyMessages.push({message: 'ANNIVERSARY'});
        }
        tmp = $('#SINCE').val();
        if (tmp && !Tools.validateDate(tmp, null)) {
          result = false;
          verifyMessages.push({message: 'SINCE'});
        }
        // country
        if (!$scope.person.home_addr_country && $('#XXC4b_value').val()) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COUNTRY'});
        }
        // company
        if ($('#XXB1_value').val() && !$scope.person.company[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COMPANY'});
        }
        // position
        if ($('#XXB2_value').val() && !$scope.person.positionBox[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'POSITION'});
        }
        // role
        if ($('#XXB3_value').val() && !$scope.person.roleBox[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'ROLE'});
        }

        for (i = 0, l = verifyMessages.length; i < l; i += 1) {
          if (i > 1) {
            verifyMessages[i].prefix = ', ';
          }
        }
        if (!result) {
          $scope.pageAncestor.addAlert({
            type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD,
            messages: verifyMessages
          });
        }
        return result;
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name createAppointment
       * @description create new appointment for current person
       * @returns void
       */
      $scope.createAppointment = function () {
        var items = [{id: $scope.person.id, name: $scope.person.first_name + ' ' + $scope.person.last_name}];
        MessengerService.setData($scope.person.is_team_member ? {teamReminderMembers: items} : {attendeeReminderMembers: items});
        $location.path('/appointment');
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name selectFile
       * @description select file
       * @param file {Object} file
       * @returns void
       */
      $scope.selectFile = function (file) {
        $scope.pictureFile = file;
        $scope.isPictureChange = true;
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name removePicture
       * @description remove picture from
       * @returns void
       */
      $scope.removePicture = function () {
        $scope.isPictureChange = $scope.person.pictureId ? true : false;
        $scope.pictureFile = {};
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name showSavePictureAnchor
       * @description return boolean for eneble/disable save anchor
       * @returns Boolean
       */
      $scope.showSavePictureAnchor = function () {
        return $scope.isPictureChange && ($scope.pictureFile && $scope.pictureFile.name ? true : false) && !$scope.inProcess;
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name showDeletePictureAnchor
       * @description return boolean for eneble/disable delete anchor
       * @returns Boolean
       */
      $scope.showDeletePictureAnchor = function () {
        return $scope.isPictureChange && !($scope.pictureFile && $scope.pictureFile.name || false) && !$scope.inProcess;
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name showRemovePictureAnchor
       * @description return boolean for eneble/disable remove anchor
       * @returns Boolean
       */
      $scope.showRemovePictureAnchor = function () {
        return ($scope.person.pictureId && !$scope.isPictureChange) || ($scope.pictureFile && $scope.pictureFile.name ? true : false);
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name getPersonPicture
       * @description create link for picture
       * @returns String
       */
      $scope.getPersonPicture = function () {
        var result = null;
        if (Object.keys($scope.pictureFile || {}).length > 0) {
          result = 'pictureFile';
        } else if ($scope.person.pictureId && !$scope.isPictureChange) {
          result = '/api/attachments/' + $scope.person.pictureId;
        } else {
          result = Constants.EMPTY_PERSON_PICTURE;
        }
        return result;
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name afterUploadPersonPicture
       * @description callback for upload file after action
       * @param response {Object} response
       * @returns void
       */
      $scope.afterUploadPersonPicture = function (response) {
        $scope.isPictureChange = false;
        $scope.person.pictureId = response.data.id;
        $scope.uploadPictureConfig.data.id = response.data.id;
        $scope.inProcess = false;
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name initPictureConfig
       * @description initialization picture config object
       * @returns void
       */
      $scope.initPictureConfig = function () {
        $scope.uploadPictureConfig = {
          url: '/api/people/' + $scope.person.id + '/picture/upload',
          errorMsg: '',
          callback: $scope.afterUploadPersonPicture,
          data: {
            table: Constants.ATTACHMENTS_TYPES.PEOPLE,
            id: $scope.person.pictureId
          }
        };
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name deletePicture
       * @description delete picture
       * @returns void
       */
      $scope.deletePicture = function () {
        var obj = {id: $scope.person.pictureId};
        AttachmentsService.del(obj).then(
          function () {
            $scope.person.pictureId = null;
            $scope.isPictureChange = false;
            $scope.inProcess = false;
          }
        );
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name initDataForAgenda
       * @description initialization data for agenda
       * @returns void
       */
      $scope.initDataForAgenda = function () {
        // Appointment
        $scope.dataForAgenda.appointment = {};
        $scope.dataForAgenda.appointment.attendeeReminderMembers = [{
          id: $scope.person.id,
          name: $scope.person.first_name + ' ' + $scope.person.last_name
        }];
        // Task
        $scope.dataForAgenda.task = {};
        $scope.dataForAgenda.task.person = [{
          id: $scope.person.id,
          name: $scope.person.first_name + ' ' + $scope.person.last_name
        }];
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name calculateBirthday
       * @description calculate birthday years and days
       * @returns void
       */
      $scope.calculateBirthday = function () {
        var tempDate = DateService.setDateAfterToday($scope.person.birthday);
        $scope.person.birthdayYears = DateService.getAge($scope.person.birthday);
        $scope.person.daysBirth = DateService.getDaysToDate(tempDate);
      };

      /**
       * @memberof PersonCtrl
       * @method
       * @name calculateAnniversary
       * @description calculate anniversary days
       * @returns void
       */
      $scope.calculateAnniversary = function () {
        var tempDate = DateService.setDateAfterToday($scope.person.anniversary);
        $scope.person.daysAnniv = DateService.getDaysToDate(tempDate);
      };

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'person',
        table: 'PEOPLE'
      });

      $scope.dp = DatepickerFactory.getInstance();
      $scope.dp.init($scope);

      $scope.initButtons();
      $scope.initPictureConfig();
      $scope.initDataForAgenda();
      $scope.calculateBirthday();
      $scope.calculateAnniversary();
    }]);
