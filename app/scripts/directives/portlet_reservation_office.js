/*jslint node: true */
'use strict';

angular.module('crmPostgresWebApp')
  .directive('portletReservationOffice', function ($http) {
    return {
      templateUrl: 'views/directives/d_portlet_reservation_office.html',
      restrict: 'E',
      controller: ['$scope','$timeout','ReservationOffice','Rooms',function($scope, $timeout, ReservationOffice, Rooms){
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        $scope.title = 'Rezervace místností';
        $scope.reservationOffice = {};
        $scope.events = [];
        $scope.rooms = [];

        // Alerts
        $scope.alerts = [];
        $scope.alertsMain = [];
        $scope.closeAlert = function(index) {
          $scope.alerts.splice(index, 1);
        };
        $scope.closeAlertMain = function(index) {
          $scope.alertsMain.splice(index, 1);
        };

        // DatePicker
        //$scope.maxDate = '2015-06-22';
        $scope.today = function() {
          $scope.reservationOffice.date = new Date();
        };
        $scope.today();

        $scope.showWeeks = false;
        $scope.toggleWeeks = function () {
          $scope.showWeeks = ! $scope.showWeeks;
        };

        $scope.clear = function () {
          $scope.reservationOffice.date = null;
        };

        // Disable weekend selection
        /*$scope.disabled = function(date, mode) {
         return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
         };*/

        $scope.toggleMin = function() {
          $scope.minDate = ( $scope.minDate ) ? null : new Date();
        };

        $scope.toggleMin();

        $scope.open = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.opened = true;
        };

        $scope.dateOptions = {
          "year-format": "'yy'",
          "starting-day": 1,
          "current-text": "Dnes",
          "toggle-weeks-text": "Týdny",
          "clear-text": "Smazat",
          "close-text": "Zavřít"
        };

        $scope.formats = ['dd.MM.yyyy', 'yyyy/MM/dd', 'shortDate'];
        $scope.format = $scope.formats[0];

        // TimePicker
        $scope.hstep = 1;
        $scope.mstep = 1;
        $scope.reservationOffice.time_from = new Date();
        $scope.reservationOffice.time_to = new Date();
        $scope.ismeridian = false;

        // main
        $scope.postReservationOffice = function(){
          ReservationOffice.post($scope.reservationOffice,
            function(data){
              if(data.type == 'success'){
                $scope.alertsMain.push(data);
                $timeout(function(){
                  $scope.alertsMain = [];
                }, 10000);
                $('#myModal').modal('hide');
                $scope.init();
              }else{
                $scope.alerts.push(data);
                $timeout(function(){
                  $scope.alerts = [];
                }, 10000);
              }
            },
            function(data){
              $scope.alerts.push({type: 'danger', msg: 'Při ukládání nové rezervace došlo k chybě.'});
              $timeout(function(){
                $scope.alerts = [];
              }, 10000);
            }
          );
        }

        $scope.deleteItem = function(index){
          ReservationOffice.delete({id: $scope.events[index].id},
            function(data){
              if(data.type == 'success'){
                $scope.alertsMain.push(data);
                $timeout(function(){
                  $scope.alertsMain = [];
                }, 10000);
                $scope.events.splice(index, 1);
                $scope.init();
              }else{
                $scope.alertsMain.push(data);
                $timeout(function(){
                  $scope.alertsMain = [];
                }, 10000);
              }
            },
            function(data){
              $scope.alertsMain.push({type: 'danger', msg: 'Při mazání rezervace došlo k chybě.'});
              $timeout(function(){
                $scope.alertsMain = [];
              }, 10000);
            });
        }

        $scope.init = function(){
          ReservationOffice.portletsList({},
            function(data){
              $scope.events = [];
              if(data){
                if(data.type == 'success'){
                  if(data.rows){
                    for (var i = 0; i < data.rows.length; i++) {
                      $scope.events.push({id: decodeURIComponent(data.rows[i].id), title: decodeURIComponent(data.rows[i].title)});
                    }
                  }
                }else{
                  $scope.alertsMain.push(data);
                  $timeout(function(){
                    $scope.alertsMain = [];
                  }, 10000);
                }
              }
            });
        }

        $scope.initRooms = function(){
          Rooms.list(function(data){
            $scope.rooms = [];
            if(data){
              for (var i = 0; i < data.rows.length; i++) {
                var obj = data.rows[i];
                $scope.rooms.push({id: data.rows[i].id, name: decodeURIComponent(data.rows[i].name)});
              }
            }
          });
        }

        // run
        $scope.init();
        $scope.initRooms();
      }]
    };
  });
