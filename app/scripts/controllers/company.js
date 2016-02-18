/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Company
 * @fileOverview CompanyCtrl
 */

/**
 * @namespace CompanyCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('CompanyCtrl', ['$scope', '$location', '$translatePartialLoader', '$translate', 'CompaniesService', 'PageAncestor', 'initialData', 'Tools', 'Constants', 'MessengerService', 'PeopleService', 'PeopleCompaniesService', 'usSpinnerService',
    function ($scope, $location, $translatePartialLoader, $translate, CompaniesService, PageAncestor, initialData, Tools, Constants, MessengerService, PeopleService, PeopleCompaniesService, usSpinnerService) {
      $translatePartialLoader.addPart('company');
      $translate.refresh();

      $scope.company = initialData.company;
      $scope.company.person = {roleBox: [], positionBox: []};
      $scope.people = [];
      $scope.opportunities = [];
      $scope.addressFields = [
        'address_tag_@',
        'address_street_@',
        'address_city_@',
        'address_region_@',
        'address_zip_@',
        'address_country_@',
        'phone_1_@',
        'phone_1_@_tag',
        'phone_2_@',
        'phone_2_@_tag',
        'phone_3_@',
        'phone_3_@_tag',
        'email_1_@',
        'email_1_@_tag',
        'email_2_@',
        'email_2_@_tag',
        'email_3_@',
        'email_3_@_tag',
        'fax_1_@',
        'fax_1_@_tag',
        'fax_2_@',
        'fax_2_@_tag',
        'website_@',
        'google_@',
        'facebook_@',
        'twitter_@'
      ];
      $scope.addressActive = 1;
      $scope.address = [];
      $scope.phone = {items: []};
      $scope.email = {items: []};
      $scope.fax = {items: []};
      $scope.pills = [
        {name: 'INTRO', hide: function () { return true; }},
        {name: 'CLASSIFICATION'},
        {name: 'AGENDA'},
        {name: 'INFO', hide: function () { return true; }},
        {name: 'PLACES',
          dropDown: [
            {name: $scope.company.address_tag_1},
            {name: $scope.company.address_tag_2},
            {name: $scope.company.address_tag_3}]
          },
        {name: 'PEOPLE', disabled: ($scope.company.id ? false : true)},
        {name: 'TIMELINE', hide: function () { return true; }},
        {name: 'SETTINGS', hide: function () { return true; }},
        {name: 'OPPORTUNITIES', disabled: ($scope.company.id ? false : true)},
        {name: 'SALES', disabled: ($scope.company.id ? false : true)},
        {name: 'ATTACHMENTS', disabled: ($scope.company.id ? false : true)}
      ];
      $scope.activePillsIndex = 1; //$scope.company.id ? 3 : 1; -- comment after hide some tabs
      $scope.peoplePaging = {};
      $scope.peoplePaging.infoPaging = {};
      $scope.peoplePaging.dataLoader = CompaniesService.people;
      $scope.peoplePaging.dataLoaderParams = {
        sortField: 'subject',
        sortDirection: 'asc',
        loadCount: true
      };
      $scope.opportunitiesPaging = {};
      $scope.opportunitiesPaging.infoPaging = {};
      $scope.opportunitiesPaging.dataLoader = CompaniesService.opportunities;
      $scope.opportunitiesPaging.dataLoaderParams = {
        sortField: 'created',
        sortDirection: 'asc',
        loadCount: true
      };
      $scope.pageAncestor = {};
      $scope.localDataCountries = initialData.countries;
      $scope.addressCountry1 = '';
      $scope.addressCountry2 = '';
      $scope.addressCountry3 = '';
      $scope.validatePhone = Tools.validatePhone;
      $scope.validateEmail = Tools.validateEmail;
      // Rating
      $scope.ratingMax = 5;
      $scope.ratingIsReadonly = false;
      $scope.actionButtons = [];
      $scope.showPersonForm = false;
      $scope.selectedPeopleObj = {};
      $scope.selectedPeople = {};
      $scope.loadDataForAgendaList = CompaniesService.listForAgenda;
      $scope.dataForAgenda = {};
      $scope.attachmentsTable = Constants.ATTACHMENTS_TYPES.COMPANY;

      $scope.initButtons = function () {
        var save = {};
        $scope.actionButtons = [
          {
            name: 'DELETE',
            dropDown: [
              {name: 'DELETE_COMPANY', onClick: $scope.del, disabled: function () {return !($scope.company.id); } },
              {name: 'DELETE_COMPANY_ADDRESS', onClick: $scope.deleteAddressConfirm, disabled: function () {return $scope.address.length === 0; }}
            ],
            disabled: !($scope.company.id)
          },
          {name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () {return !$scope.pageAncestor.log.changes.isChanged; }}
        ];
        if ($scope.company.id) {
          save = {name: 'SAVE', onClick: $scope.put, disabled: function () {return false; }};
        } else {
          save = {name: 'SAVE', onClick: $scope.post, disabled: function () {return false; }};
        }
        $scope.actionButtons.push(save);
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name initAbstractFields
       * @description init abstract fields for form
       * @returns void
       */
      $scope.initAbstractFields = function () {
        $scope.setAbstractField($scope.phone, 'phone', 3);
        $scope.setAbstractField($scope.email, 'email', 3);
        $scope.setAbstractField($scope.fax, 'fax', 2);
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name initAbstractFieldsAll
       * @description init all abstract fields for form
       * @returns void
       */
      $scope.initAbstractFieldsAll = function () {
        $scope.setNavbarAddress();
        $scope.initAbstractFields();
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name showAddressPlus
       * @description true if address is not complete
       * @returns Boolean
       */
      $scope.showAddressPlus = function () {
        return (!$scope.existsAddress(1) || !$scope.existsAddress(2)) && $scope.existsAddress(0);
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name deleteAddress
       * @description delete active item of address
       * @returns void
       */
      $scope.deleteAddress = function () {
        var i, l;
        for (i = 0, l = $scope.addressFields.length; i < l; i += 1) {
          $scope.company[$scope.addressFields[i].replace(/@/g, $scope.addressActive)] = null;
        }
        $scope.setNavbarAddress();
        $scope.addressActive = $scope.address.length;
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name deleteAddressConfirm
       * @description show confirm for delete address
       * @returns void
       */
      $scope.deleteAddressConfirm = function () {
        var btns = [{}, {}], fceOK;
        fceOK = function () {
          $scope.deleteAddress();
        };
        btns[0].name = 'OK';
        btns[0].onClick = fceOK;
        btns[1].name = 'STORNO';
        btns[1].onClick = null;
        // Run confirm dialog
        $scope.pageAncestor.addAlert({type: Constants.MESSAGE_WARNING_MODAL, message: 'INFO_RECORD_ADDRESS_DELETE', title: 'WARNING', buttons: btns});
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name existsAddress
       * @description return true if address exists
       * @param index {Number} number of address
       * @returns Boolean
       */
      $scope.existsAddress = function (index) {
        var i, l, tmp = '';
        for (i = 0, l = $scope.addressFields.length; i < l; i += 1) {
          if ($scope.company[$scope.addressFields[i].replace(/@/g, (index + 1))]) {
            tmp += $scope.company[$scope.addressFields[i].replace(/@/g, (index + 1))];
          }
        }
        return tmp.length > 0;
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name setActiveAddress
       * @description set current address to view
       * @returns void
       */
      $scope.setActiveAddress = function (index) {
        $scope.addressActive = index + 1;
        $scope.initAbstractFields();
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name addAddressNavbar
       * @description add item to navbar
       * @returns void
       */
      $scope.addAddressNavbar = function () {
        $scope.setNavbarAddress();
        $scope.setActiveAddress($scope.address.length);
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name post
       * @description post data for new company
       * @returns void
       */
      $scope.post = function () {
        if ($scope.verifyForm()) {
          $scope.setDefault();
          $scope.pageAncestor.post(function () {
            return CompaniesService.post($scope.company).then(function (promise) {
              if (promise.data.id) {
                $location.path('/company/' + promise.data.id);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name put
       * @description post data for new company
       * @returns void
       */
      $scope.put = function () {
        if ($scope.verifyForm()) {
          $scope.setDefault();
          $scope.pageAncestor.put(function () {
            return CompaniesService.put($scope.company).then(function (promise) {
              $scope.initAbstractFieldsAll();
              return promise;
            });
          });
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name del
       * @description delete company
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return CompaniesService.del($scope.company).then(function (promise) {
            if (promise.data && promise.data.message && promise.data.message.type === Constants.MESSAGE_SUCCESS) {
              if (promise.data.id) {
                $location.path('/company/' + promise.data.id);
              } else {
                $location.path('/companies');
              }
            }
            return promise;
          });
        });
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name addressMove
       * @description move address fields from to
       * @returns void
       */
      $scope.addressMove = function (from, to) {
        var i, l;
        for (i = 0, l = $scope.addressFields.length; i < l; i += 1) {
          $scope.company[$scope.addressFields[i].replace(/@/g, to)] = $scope.company[$scope.addressFields[i].replace(/@/g, from)];
          $scope.company[$scope.addressFields[i].replace(/@/g, from)] = null;
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name moveDataWithTag
       * @description move field from to
       * @returns void
       */
      $scope.moveDataWithTag = function (field, from, to) {
        $scope.company[field + '_' + to + '_' + $scope.addressActive] = $scope.company[field + '_' + from + '_' + $scope.addressActive];
        $scope.company[field + '_' + to + '_' + $scope.addressActive + '_tag'] = $scope.company[field + '_' + from + '_' + $scope.addressActive + '_tag'];
        $scope.company[field + '_' + from + '_' + $scope.addressActive] = null;
        $scope.company[field + '_' + from + '_' + $scope.addressActive + '_tag'] = null;
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name setNavbarAddress
       * @description set items of address navbar
       * @returns void
       */
      $scope.setNavbarAddress = function () {
        $scope.address = [];
        if ($scope.existsAddress(0)) {
          $scope.address.push({name: $scope.company.address_tag_1 || '1'});
        } else {
          if ($scope.existsAddress(1)) {
            $scope.addressMove(2, 1);
          }
        }
        if ($scope.existsAddress(1)) {
          $scope.address.push({name: $scope.company.address_tag_2 || '2'});
        } else {
          if ($scope.existsAddress(2)) {
            $scope.addressMove(3, 2);
          }
        }
        if ($scope.existsAddress(2)) {
          $scope.address.push({name: $scope.company.address_tag_3 || '3'});
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name setAbstractField
       * @description set abstract field in form
       * @param obj {Object} abstract object for field
       * @param fieldName {String} name of field for abstract object
       * @param count {Number} count items for abstract object
       * @returns void
       */
      $scope.setAbstractField = function (obj, fieldName, count) {
        var i;
        obj.items = [1];
        for (i = 1; i <= count; i += 1) {
          if ($scope.company[fieldName + '_' + i + '_' + $scope.addressActive]) {
            obj.items[i - 1] = i;
          } else {
            if ($scope.company[fieldName + '_' + (i + 1) + '_' + $scope.addressActive]) {
              $scope.moveDataWithTag(fieldName, i + 1, i);
              obj.items[i - 1] = i;
            }
          }
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name addAbstractField
       * @description add field for abstract array
       * @param obj {Object} abstract object for field
       * @param count {Number} count items for abstract object
       * @param enable {Boolean} enable action
       * @returns void
       */
      $scope.addAbstractField = function (obj, count, enable) {
        if (enable) {
          if (obj.items.length < count) {
            obj.items[obj.items.length] = obj.items.length + 1;
          }
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name deleteFieldWithTag
       * @description delete field data from form
       * @param obj {Object} abstract object for field
       * @param fieldName {String} name of field
       * @param index {Number} index
       * @param enable {Boolean} enable action
       * @returns void
       */
      $scope.deleteFieldWithTag = function (obj, fieldName, index, enable) {
        if (enable) {
          if (index > 0) {
            obj.items.splice(index, 1);
          } else {
            obj.items[0] = null;
          }
          $scope.company[fieldName + '_' + (index + 1) + '_' + $scope.addressActive] = null;
          $scope.company[fieldName + '_' + (index + 1) + '_' + $scope.addressActive + '_tag'] = null;
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name verifyForm
       * @description validation form data
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // verify type_id input data
        if (!$scope.company.company_name) {
          result = false;
          verifyMessages.push({message: 'COMPANY_NAME'});
        }
        // verify countries input data
        /*if ($scope.addressCountry1 && !Tools.getItemFromArray($scope.addressCountry1, 'name', $scope.localDataCountries, 'id')) {
          result = false;
          verifyMessages.push({message: 'COUNTRY', sufix: ' (adresa: ' + $scope.company.address_tag_1 + ')'});
        }*/
        if (!$scope.company.address_country_1 && $('#XXX8_value').val()) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COUNTRY'});
        }
        /*if ($scope.addressCountry2 && !Tools.getItemFromArray($scope.addressCountry2, 'name', $scope.localDataCountries, 'id')) {
          result = false;
          verifyMessages.push({message: 'COUNTRY', sufix: ' (adresa: ' + $scope.company.address_tag_2 + ')'});
        }*/
        if (!$scope.company.address_country_2 && $('#XXX82_value').val()) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COUNTRY'});
        }
        /*if ($scope.addressCountry3 && !Tools.getItemFromArray($scope.addressCountry3, 'name', $scope.localDataCountries, 'id')) {
          result = false;
          verifyMessages.push({message: 'COUNTRY', sufix: ' (adresa: ' + $scope.company.address_tag_3 + ')'});
        }*/
        if (!$scope.company.address_country_3 && $('#XXX83_value').val()) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COUNTRY'});
        }
        // verify emails
        // address 1
        if ($scope.company.email_1_1 && !Tools.validateEmail($scope.company.email_1_1)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '1 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        if ($scope.company.email_2_1 && !Tools.validateEmail($scope.company.email_2_1)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '2 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        if ($scope.company.email_3_1 && !Tools.validateEmail($scope.company.email_3_1)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '3 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        // address 2
        if ($scope.company.email_1_2 && !Tools.validateEmail($scope.company.email_1_2)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '1 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        if ($scope.company.email_2_2 && !Tools.validateEmail($scope.company.email_2_2)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '2 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        if ($scope.company.email_3_2 && !Tools.validateEmail($scope.company.email_3_2)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '3 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        // address 3
        if ($scope.company.email_1_3 && !Tools.validateEmail($scope.company.email_1_3)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '1 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        if ($scope.company.email_2_3 && !Tools.validateEmail($scope.company.email_2_3)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '2 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        if ($scope.company.email_3_3 && !Tools.validateEmail($scope.company.email_3_3)) {
          result = false;
          verifyMessages.push({message: 'EMAIL', sufix: '3 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        // verify phones
        // address 1
        if ($scope.company.phone_1_1 && !Tools.validatePhone($scope.company.phone_1_1)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '1 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        if ($scope.company.phone_2_1 && !Tools.validatePhone($scope.company.phone_2_1)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '2 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        if ($scope.company.phone_3_1 && !Tools.validatePhone($scope.company.phone_3_1)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '3 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        // address 2
        if ($scope.company.phone_1_2 && !Tools.validatePhone($scope.company.phone_1_2)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '1 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        if ($scope.company.phone_2_2 && !Tools.validatePhone($scope.company.phone_2_2)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '2 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        if ($scope.company.phone_3_2 && !Tools.validatePhone($scope.company.phone_3_2)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '3 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        // address 3
        if ($scope.company.phone_1_3 && !Tools.validatePhone($scope.company.phone_1_3)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '1 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        if ($scope.company.phone_2_3 && !Tools.validatePhone($scope.company.phone_2_3)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '2 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        if ($scope.company.phone_3_3 && !Tools.validatePhone($scope.company.phone_3_3)) {
          result = false;
          verifyMessages.push({message: 'PHONE', sufix: '3 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        // verify faxes
        // address 1
        if ($scope.company.fax_1_1 && !Tools.validatePhone($scope.company.fax_1_1)) {
          result = false;
          verifyMessages.push({message: 'FAX', sufix: '1 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        if ($scope.company.fax_2_1 && !Tools.validatePhone($scope.company.fax_2_1)) {
          result = false;
          verifyMessages.push({message: 'FAX', sufix: '2 (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        // address 2
        if ($scope.company.fax_1_2 && !Tools.validatePhone($scope.company.fax_1_2)) {
          result = false;
          verifyMessages.push({message: 'FAX', sufix: '1 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        if ($scope.company.fax_2_2 && !Tools.validatePhone($scope.company.fax_2_2)) {
          result = false;
          verifyMessages.push({message: 'FAX', sufix: '2 (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        // address 3
        if ($scope.company.fax_1_3 && !Tools.validatePhone($scope.company.fax_1_3)) {
          result = false;
          verifyMessages.push({message: 'FAX', sufix: '1 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        if ($scope.company.fax_2_3 && !Tools.validatePhone($scope.company.fax_2_3)) {
          result = false;
          verifyMessages.push({message: 'FAX', sufix: '2 (adresa: ' + $scope.company.address_tag_3 + ')'});
        }
        // verify zip
        // address 1
        if ($scope.company.address_zip_1 && !Tools.validateZip($scope.company.address_zip_1)) {
          result = false;
          verifyMessages.push({message: 'ZIP', sufix: ' (adresa: ' + $scope.company.address_tag_1 + ')'});
        }
        // address 2
        if ($scope.company.address_zip_2 && !Tools.validateZip($scope.company.address_zip_2)) {
          result = false;
          verifyMessages.push({message: 'ZIP', sufix: ' (adresa: ' + $scope.company.address_tag_2 + ')'});
        }
        // address 3
        if ($scope.company.address_zip_3 && !Tools.validateZip($scope.company.address_zip_3)) {
          result = false;
          verifyMessages.push({message: 'ZIP', sufix: ' (adresa: ' + $scope.company.address_tag_3 + ')'});
        }

        for (i = 0, l = verifyMessages.length; i < l; i += 1) {
          if (i > 1) {
            verifyMessages[i].prefix = ', ';
          }
        }
        if (!result) {
          $scope.pageAncestor.addAlert({type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD, messages: verifyMessages});
        }
        return result;
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name setDefault
       * @description set default values
       * @returns void
       */
      $scope.setDefault = function () {
        //$scope.company.company_name = $scope.company.company_name || Math.random().toString(36).slice(2, 20); // dočasně, než bude form na pořízení
        if ($scope.existsAddress(0) && !$scope.company.address_tag_1) {
          $scope.company.address_tag_1 = '1';
        }
        if ($scope.existsAddress(1) && !$scope.company.address_tag_2) {
          $scope.company.address_tag_2 = '2';
        }
        if ($scope.existsAddress(2) && !$scope.company.address_tag_3) {
          $scope.company.address_tag_3 = '3';
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name createAppointment
       * @description create new appointment with current company
       * @returns void
       */
      $scope.createAppointment = function () {
        MessengerService.setData({company: [{id: $scope.company.id, name: $scope.company.company_name}]});
        $location.path('/appointment');
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name clearPersonForm
       * @description clear person form for smal insert person
       * @returns void
       */
      $scope.clearPersonForm = function () {
        $scope.company.person = {roleBox: [], positionBox: []};
        $scope.showPersonForm = false;
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name verifyFormPerson
       * @description validation form data for person
       * @returns Boolean
       */
      $scope.verifyFormPerson = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});
        if (!$scope.company.person.first_name) {
          result = false;
          verifyMessages.push({message: 'FIRSTNAME'});
        }
        if (!$scope.company.person.last_name) {
          result = false;
          verifyMessages.push({message: 'LASTNAME'});
        }
        if ($scope.company.person.email && !Tools.validateEmail($scope.company.person.email)) {
          result = false;
          verifyMessages.push({message: 'EMAIL'});
        }
        if ($scope.company.person.business_phone && !Tools.validatePhone($scope.company.person.business_phone)) {
          result = false;
          verifyMessages.push({message: 'BUSINESS_PHONE'});
        }
        if ($scope.company.person.mobile_phone && !Tools.validatePhone($scope.company.person.mobile_phone)) {
          result = false;
          verifyMessages.push({message: 'MOBILE_PHONE'});
        }
        if ($('#PERSON_ROLE_value').val() && !$scope.company.person.roleBox[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'ROLE'});
        }
        if ($('#PERSON_POSITION_value').val() && !$scope.company.person.positionBox[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'POSITION'});
        }

        for (i = 0, l = verifyMessages.length; i < l; i += 1) {
          if (i > 1) {
            verifyMessages[i].prefix = ', ';
          }
        }
        if (!result) {
          $scope.pageAncestor.addAlert({type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD, messages: verifyMessages});
        }
        return result;
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name insertPerson
       * @description create person
       * @returns void
       */
      $scope.insertPerson = function () {
        $scope.company.person.companies_id = $scope.company.id;
        $scope.company.person.company_name = $scope.company.company_name;
        if ($scope.verifyFormPerson()) {
          $scope.pageAncestor.postPart(function () {
            return PeopleService.post($scope.company.person).then(function (promise) {
              $scope.clearPersonForm();
              $scope.reloadPeople();
              return promise;
            });
          });
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name reloadPeople
       * @description reload people list
       * @returns void
       */
      $scope.reloadPeople = function () {
        $scope.peoplePaging.dataLoaderParams.reloadHash = Math.random();
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name revokePeople
       * @description revoke people from company
       * @returns void
       */
      $scope.revokePeople = function () {
        var obj = {};
        obj.people = Tools.objectWithBooleanToArray($scope.selectedPeopleObj);
        obj.companyId = $scope.company.id;
        if (Object.keys($scope.selectedPeopleObj).length < 1) {
          return;
        }
        $scope.pageAncestor.confirm(
          function () {
            usSpinnerService.spin('spinner-revoke-people');
            return PeopleCompaniesService.revokePeople(obj).then(function (promise) {
              // refresh data
              $scope.refreshDataAfterRevokePeople(promise.data, obj);
              // stop spinner
              usSpinnerService.stop('spinner-revoke-people');
              return promise;
            });
          },
          Constants.MESSAGE_EXEC_REVOKE_PEOPLE,
          Constants.MESSAGE_EXEC_REVOKE_PEOPLE_SUCCESS,
          Constants.MESSAGE_EXEC_REVOKE_PEOPLE_ERROR
        );
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name refreshDataAfterRevokePeople
       * @description refresh after revoke people
       * @returns void
       */
      $scope.refreshDataAfterRevokePeople = function (response, obj) {
        if (response.message && response.message.type === Constants.MESSAGE_SUCCESS) {
          $scope.people = $scope.people.filter(function (el, i) {
            return obj.people.indexOf(String(el.id)) === -1;
          });
        }
      };

      /**
       * @memberof CompanyCtrl
       * @method
       * @name newOpportunity
       * @description new opportunity
       * @returns void
       */
      $scope.newOpportunity = function () {
        MessengerService.setData({company: [{id: $scope.company.id, name: $scope.company.company_name}]});
        $location.path('/opportunity');
      };

      $scope.isSelectedPeople = function () {
        var arr = Object.keys($scope.selectedPeopleObj);
        return (arr ? arr.length : 0) > 0;
      };

      // Watchers
      $scope.$watch('company', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $scope.setNavbarAddress();
        }
      }, true);

      /**
       * @memberof CompanyCtrl
       * @method
       * @name initDataForAgenda
       * @description initialization data for agenda
       * @returns void
       */
      $scope.initDataForAgenda = function () {
        // Appointment
        $scope.dataForAgenda.appointment = {};
        $scope.dataForAgenda.appointment.company = [{id: $scope.company.id, name: $scope.company.company_name}];
        // Task
        $scope.dataForAgenda.task = {};
        $scope.dataForAgenda.task.company = [{id: $scope.company.id, name: $scope.company.company_name}];
      };

      // Run
      $scope.initAbstractFieldsAll();
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'company',
        table: 'COMPANIES'
      });
      $scope.initButtons();
      $scope.initDataForAgenda();
    }]);
