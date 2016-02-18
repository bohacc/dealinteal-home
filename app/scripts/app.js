/*jslint node: true, unparam: true */
'use strict';

angular.module('crmPostgresWebApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'ui.bootstrap.datepicker',
  'ui.bootstrap.buttons',
  "template/datepicker/datepicker.html",
  "template/datepicker/popup.html",
  "template/datepicker/day.html",
  "template/datepicker/month.html",
  "template/datepicker/year.html",
  'ui.calendar',
  'mgcrea.ngStrap.timepicker',
  'mgcrea.ngStrap.popover',
  'pascalprecht.translate',
  'tmh.dynamicLocale',
  'btford.socket-io',
  'angularSpinner',
  'ngFileUpload',
  'chart.js',
  'textAngular'
])
  .config(function ($routeProvider, /*cfpLoadingBarProvider,*/ $translateProvider, tmhDynamicLocaleProvider, $httpProvider, uibDatepickerConfig, $provide) {
    $httpProvider.interceptors.push('authHttpResponseInterceptor');

    $routeProvider
      .when('/', {
        title: 'LOGIN_TITLE',
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/login', {
        title: 'LOGIN_TITLE',
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/error', {
        title: 'ERROR_TITLE',
        templateUrl: 'views/error.html'
      })
      .when('/home', {
        title: 'DASHBOARD_TITLE',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/profil', {
        title: 'PROFILE_TITLE',
        templateUrl: 'views/profile.html',
        controller: 'ProfileController'
      })
      .when('/rezervace-mistnosti', {
        title: 'RESERVATION_ROOMS',
        templateUrl: 'views/reservation_office.html',
        controller: 'ReservationOfficeCtrl'
      })
      .when('/crm', {
        title: 'CRM',
        templateUrl: 'views/crm.html',
        controller: 'CrmCtrl'
      })
      .when('/opportunities', {
        title: 'OPPORTUNITIES',
        templateUrl: 'views/opportunities.html',
        controller: 'OpportunitiesCtrl',
        resolve: {
          initialData: ['OpportunitiesService', function (OpportunitiesService) {
            return OpportunitiesService.list({sortField: 'subject', sortDirection: 'asc'}).then(function (promise) {
              return {opportunities: promise.data};
            });
          }]
        }
      })
      .when('/opportunity', {
        title: 'OPPORTUNITY',
        templateUrl: 'views/opportunity.html',
        controller: 'OpportunityCtrl',
        resolve: {
          initialData: ['$q', 'SalesPipelineStagesService', 'MessengerService', function ($q, SalesPipelineStagesService, MessengerService) {
            var stages = SalesPipelineStagesService.list();
            return $q.all([stages]).then(function (results) {
              return {
                opportunity: MessengerService.getData() || {},
                stages: (results[0].data || {})
              };
            });
          }]
        }
      })
      .when('/opportunity/:id', {
        title: 'OPPORTUNITY',
        templateUrl: 'views/opportunity.html',
        controller: 'OpportunityCtrl',
        resolve: {
          initialData: ['$q', '$route', 'OpportunitiesService', 'SalesPipelineStagesService', function ($q, $route, OpportunitiesService, SalesPipelineStagesService) {
            var opportunity = OpportunitiesService.get({id: $route.current.params.id}), stages = SalesPipelineStagesService.list();
            return $q.all([opportunity, stages]).then(function (results) {
              return {
                opportunity: (results[0].data || {}),
                stages: (results[1].data || [])
              };
            });
          }]
        }
      })
      .when('/sales-pipeline', {
        title: 'SALES_PIPELINE',
        templateUrl: 'views/sales_pipeline.html',
        controller: 'SalesPipelineCtrl',
        resolve: {
          initialData: ['$q', 'SalesPipelineStagesService', function ($q, SalesPipelineStagesService) {
            var stages = SalesPipelineStagesService.list(), stagesRows = {}, row, i, l;
            return $q.all([stages]).then(function (results) {
              for (i = 0, l = results[0].data.length; i < l; i += 1) {
                row = results[0].data[i];
                stagesRows[row.id] = {};
              }
              return {
                opportunity: {},
                stages: (results[0].data || []),
                stagesRows: stagesRows
              };
            });
          }]
        }
      })
      .when('/vyvoj', {
        title: 'DEVELOP',
        templateUrl: 'views/vyvoj.html',
        controller: 'VyvojCtrl'
      })
      .when('/people', {
        title: 'PEOPLE',
        templateUrl: 'views/people.html',
        controller: 'PeopleCtrl',
        resolve: {
          initialData: ['PeopleService', function (PeopleService) {
            return PeopleService.list({sortField: 'last_name', sortDirection: 'asc'}).then(function (promise) {
              return {people: promise.data, teamMember: 0};
            });
          }]
        }
      })
      .when('/person/:id', {
        title: 'PERSON',
        templateUrl: 'views/person.html',
        controller: 'PersonCtrl',
        resolve: {
          initialData: ['$q', '$route', 'PeopleService', 'CountriesService', function ($q, $route, PeopleService, CountriesService) {
            var person = PeopleService.get($route.current.params.id), countries = CountriesService.list(), personObj;
            return $q.all([person, countries]).then(function (results) {
              personObj = results[0].data;
              personObj.teamMember = 0;
              return {person: personObj, countries: results[1].data};
            });
          }]
        }
      })
      .when('/person', {
        title: 'PERSON',
        templateUrl: 'views/person.html',
        controller: 'PersonCtrl',
        resolve: {
          initialData: ['$q', 'CountriesService', function ($q, CountriesService) {
            var countries = CountriesService.list();
            return $q.all([countries]).then(function (results) {
              return {person: {teamMember: 0}, countries: results[0].data};
            });
          }]
        }
      })
      .when('/team-members', {
        title: 'TEAM_MEMBERS',
        templateUrl: 'views/people.html',
        controller: 'PeopleCtrl',
        resolve: {
          initialData: ['PeopleService', function (PeopleService) {
            return PeopleService.teamMembersList({
              sortField: 'last_name',
              sortDirection: 'asc',
              teamMember: 1
            }).then(function (promise) {
              return {people: promise.data, teamMember: 1};
            });
          }]
        }
      })
      .when('/team-member/:id', {
        title: 'TEAM_MEMBER',
        templateUrl: 'views/person.html',
        controller: 'PersonCtrl',
        resolve: {
          initialData: ['$q', '$route', 'PeopleService', 'CountriesService', function ($q, $route, PeopleService, CountriesService) {
            var person = PeopleService.get($route.current.params.id), countries = CountriesService.list(), personObj;
            return $q.all([person, countries]).then(function (results) {
              personObj = results[0].data;
              personObj.teamMember = 1;
              return {person: personObj, countries: results[1].data};
            });
          }]
        }
      })
      .when('/team-member', {
        title: 'TEAM_MEMBER',
        templateUrl: 'views/person.html',
        controller: 'PersonCtrl',
        resolve: {
          initialData: ['$q', 'CountriesService', function ($q, CountriesService) {
            var countries = CountriesService.list();
            return $q.all([countries]).then(function (results) {
              return {person: {teamMember: 1}, countries: results[0].data};
            });
          }]
        }
      })
      .when('/config', {
        title: 'CONFIG_TITLE',
        templateUrl: 'views/config.html',
        controller: 'ConfigCtrl'
      })
      .when('/test', {
        title: 'PAGE_TITLE',
        templateUrl: 'views/test.html',
        controller: 'TestCtrl'
      })
      .when('/company/:id', {
        title: 'COMPANY',
        templateUrl: 'views/company.html',
        controller: 'CompanyCtrl',
        resolve: {
          initialData: ['$q', '$route', 'CountriesService', 'CompaniesService', function ($q, $route, CountriesService, CompaniesService) {
            var countries = CountriesService.list(), company = CompaniesService.get($route.current.params.id);
            return $q.all([company, countries]).then(function (results) {
              return {company: results[0].data, countries: results[1].data};
            });
          }]
        }
      })
      .when('/company', {
        title: 'COMPANY',
        templateUrl: 'views/company.html',
        controller: 'CompanyCtrl',
        resolve: {
          initialData: ['$q', 'CountriesService', function ($q, CountriesService) {
            var countries = CountriesService.list();
            return $q.all([countries]).then(function (results) {
              return {company: {}, countries: results[0].data};
            });
          }]
        }
      })
      .when('/companies', {
        title: 'COMPANIES',
        templateUrl: 'views/companies.html',
        controller: 'CompaniesCtrl',
        resolve: {
          companies: ['CompaniesService', function (CompaniesService) {
            return CompaniesService.list({sortField: 'company_name', sortDirection: 'asc'}).then(function (promise) {
              return promise.data;
            });
          }]
        }
      })
      .when('/appointment', {
        title: 'APPOINTMENT',
        templateUrl: 'views/appointment.html',
        controller: 'AppointmentCtrl',
        resolve: {
          initialData: ['$q', 'AppointmentService', 'MessengerService', function ($q, AppointmentService, MessengerService) {
            var places = AppointmentService.places(), types = AppointmentService.types();
            return $q.all([places, types]).then(function (results) {
              return {appointment: MessengerService.getData().appointment || {}, places: results[0].data, types: results[1].data};
            });
          }]
        }
      })
      .when('/appointment/:id', {
        title: 'APPOINTMENT',
        templateUrl: 'views/appointment.html',
        controller: 'AppointmentCtrl',
        resolve: {
          initialData: ['$q', '$route', 'AppointmentService', function ($q, $route, AppointmentService) {
            var places = AppointmentService.places(), types = AppointmentService.types(), appointment = AppointmentService.get($route.current.params.id);
            return $q.all([appointment, places, types]).then(function (results) {
              return {appointment: results[0].data, places: results[1].data, types: results[2].data};
            });
          }]
        }
      })
      .when('/appointments', {
        title: 'APPOINTMENTS',
        templateUrl: 'views/appointments.html',
        controller: 'AppointmentsCtrl',
        resolve: {
          initialData: ['AppointmentService', function (AppointmentService) {
            return AppointmentService.list({sortField: 'subject', sortDirection: 'asc'}).then(function (promise) {
              return {appointments: promise.data};
            });
          }]
        }
      })
      .when('/reminder', {
        title: 'REMINDER',
        templateUrl: 'views/reminder.html',
        controller: 'ReminderCtrl',
        resolve: {
          initialData: ['PeopleService', 'MessengerService', function (PeopleService, MessengerService) {
            return PeopleService.loginUserEmails().then(function (result) {
              return {reminder: MessengerService.getData(), people: result.data || {}};
            });
          }]
        }
      }).when('/reminder/:id', {
        title: 'REMINDER',
        templateUrl: 'views/reminder.html',
        controller: 'ReminderCtrl',
        resolve: {
          initialData: ['$q', '$route', 'PeopleService', 'ReminderService', function ($q, $route, PeopleService, ReminderService) {
            var emails = PeopleService.loginUserEmails(), reminder = ReminderService.get($route.current.params.id);
            return $q.all([reminder, emails]).then(function (results) {
              return {reminder: results[0].data || {}, people: results[1].data || {}};
            });
          }]
        }
      })
      .when('/reminders', {
        title: 'REMINDERS',
        templateUrl: 'views/reminders.html',
        controller: 'RemindersCtrl',
        resolve: {
          initialData: ['ReminderService', function (ReminderService) {
            return ReminderService.list({sortField: 'original_time', sortDirection: 'desc'}).then(function (promise) {
              return {reminders: promise.data};
            });
          }]
        }
      })
      .when('/calendar', {
        title: 'PAGE_TITLE',
        templateUrl: 'views/calendar.html',
        controller: 'CalendarCtrl',
        resolve: {
          initialData: ['$q', '$rootScope', 'AppointmentService', 'ReminderService', 'UsersService', 'MessengerService', function ($q, $rootScope, AppointmentService, ReminderService, UsersService, MessengerService) {
            var appointments = AppointmentService.listForCalendar({ownerId: $rootScope.meta.ownerId}),
              reminders = ReminderService.listForCalendar({ownerId: $rootScope.meta.ownerId}),
              usersWithoutOwner = UsersService.listWithoutOwner();
            return $q.all([reminders, appointments, usersWithoutOwner]).then(function (results) {
              var msg = MessengerService.getData();
              return {
                appointmentId: msg.appointmentId,
                scrollTime: msg.scrollTime,
                defaultView: msg.defaultView,
                defaultCalendarDate: msg.defaultCalendarDate,
                appointmentsCalendar: results[1].data.length > 0 ? results[1].data : [{title: '', start: '2013-12-11T00:00:00.000Z'}],
                reminderCalendar: results[0].data.length > 0 ? results[0].data : [{title: '', start: '2013-12-11T00:00:00.000Z'}],
                usersWithoutOwner: results[2].data
              };
            });
          }]
        }
      })
      .when('/agenda', {
        title: 'AGENDA_TITLE',
        templateUrl: 'views/agenda.html',
        controller: 'AgendaCtrl'
      })
      .when('/task', {
        title: 'TASK',
        templateUrl: 'views/task.html',
        controller: 'TaskCtrl',
        resolve: {
          initialData: ['$q', 'MessengerService', 'UsersService', function ($q, MessengerService, UsersService) {
            var usersWithoutOwner = UsersService.listWithoutOwner();
            return $q.all([usersWithoutOwner]).then(function (results) {
              return {
                task: MessengerService.getData().task || {},
                usersWithoutOwner: results[0].data
              };
            });
          }]
        }
      })
      .when('/task/:id', {
        title: 'TASK',
        templateUrl: 'views/task.html',
        controller: 'TaskCtrl',
        resolve: {
          initialData: ['$q', '$route', 'TasksService', 'UsersService', function ($q, $route, TasksService, UsersService) {
            var task = TasksService.get($route.current.params.id), usersWithoutOwner = UsersService.listWithoutOwner();
            return $q.all([task, usersWithoutOwner]).then(function (results) {
              return {
                task: results[0].data,
                usersWithoutOwner: results[1].data
              };
            });
          }]
        }
      })
      .when('/tasks', {
        title: 'TASKS',
        templateUrl: 'views/tasks.html',
        controller: 'TasksCtrl'
      })
      .when('/sales-plan', {
        title: 'SALES_PLAN',
        templateUrl: 'views/sales_plan.html',
        controller: 'SalesPlanCtrl',
        resolve: {
          initialData: ['$q', 'SalesPlanService', 'MessengerService', function ($q, SalesPlanService, MessengerService) {
            var years = SalesPlanService.yearsForFilter(), months = SalesPlanService.monthsForFilter(), quarter = SalesPlanService.quarterForFilter();
            return $q.all([years, months, quarter]).then(function (results) {
              return {
                salesPlan: MessengerService.getData(),
                years: SalesPlanService.yearsArrayForFilter(results[0].data),
                months: SalesPlanService.monthsArrayForFilter(results[1].data),
                quarter: SalesPlanService.monthsArrayForFilter(results[2].data)
              };
            });
          }]
        }
      })
      .when('/our-company', {
        title: 'OUR_COMPANY',
        templateUrl: 'views/our_company.html',
        controller: 'OurCompanyCtrl'
      })
      .when('/products', {
        title: 'PRODUCTS',
        templateUrl: 'views/products.html',
        controller: 'ProductsCtrl',
        resolve: {
          initialData: ['ProductsService', function (ProductsService) {
            return ProductsService.list({sortField: 'name', sortDirection: 'asc'}).then(function (promise) {
              return {products: promise.data};
            });
          }]
        }
      })
      .when('/product/:id', {
        title: 'PRODUCT',
        templateUrl: 'views/product.html',
        controller: 'ProductCtrl',
        resolve: {
          initialData: ['$q', '$route', 'ProductsService', 'CurrencyService', 'UnitsService', function ($q, $route, ProductsService, CurrencyService, UnitsService) {
            var currency = CurrencyService.list(), units = UnitsService.list(), product = ProductsService.get($route.current.params.id);
            return $q.all([product, currency, units]).then(function (results) {
              return {product: results[0].data, currency: results[1].data, units: results[2].data};
            });
          }]
        }
      })
      .when('/product', {
        title: 'PRODUCT',
        templateUrl: 'views/product.html',
        controller: 'ProductCtrl',
        resolve: {
          initialData: ['$q', 'CurrencyService', 'UnitsService', 'MessengerService', function ($q, CurrencyService, UnitsService, MessengerService) {
            var currency = CurrencyService.list(), units = UnitsService.list();
            return $q.all([currency, units]).then(function (results) {
              return {product: MessengerService.getData(), currency: results[0].data, units: results[1].data};
            });
          }]
        }
      })
      .when('/projects', {
        title: 'PROJECTS',
        templateUrl: 'views/projects.html',
        controller: 'ProjectsCtrl',
        resolve: {
          initialData: ['ProjectsService', function (ProjectsService) {
            return ProjectsService.list({sortField: 'subject', sortDirection: 'asc'}).then(function (promise) {
              return {projects: promise.data};
            });
          }]
        }
      })
      .when('/project/:id', {
        title: 'PROJECT',
        templateUrl: 'views/project.html',
        controller: 'ProjectCtrl',
        resolve: {
          initialData: ['$q', '$route', 'ProjectsService', function ($q, $route, ProjectsService) {
            var project = ProjectsService.get($route.current.params.id);
            return $q.all([project]).then(function (results) {
              return {
                project: results[0].data
              };
            });
          }]
        }
      })
      .when('/project', {
        title: 'PROJECT',
        templateUrl: 'views/project.html',
        controller: 'ProjectCtrl',
        resolve: {
          initialData: ['MessengerService', function (MessengerService) {
            return {
              project: MessengerService.getData()
            };
          }]
        }
      })
      .when('/search/:code/:hash', {
        title: 'SEARCH_TITLE',
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .when('/changelog', {
        title: 'CHANGELOG_TITLE',
        templateUrl: 'views/changelog.html',
        controller: 'ChangelogCtrl'
      })
      .when('/changelogs', {
        title: 'CHANGELOGS_TITLE',
        templateUrl: 'views/changelogs.html',
        controller: 'ChangelogsCtrl',
        resolve: {
          initialData: ['ChangelogsService', function (ChangelogsService) {
            return ChangelogsService.list({sortField: 'table_name', sortDirection: 'asc'}).then(function (promise) {
              return {changelogs: promise.data};
            });
          }]
        }
      })
      .when('/companies-import', {
        title: 'COMPANIES_IMPORT_TITLE',
        templateUrl: 'views/companies_import.html',
        controller: 'CompaniesImportCtrl'
      })
      .when('/dashboard', {
        title: 'DASHBOARD_TITLE',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/sales', {
        title: 'SALES_TITLE',
        templateUrl: 'views/sales.html',
        controller: 'SalesCtrl'
      })
      .when('/pipeline-setup', {
        title: 'PIPELINE_SETUP_TITLE',
        templateUrl: 'views/pipeline_setup.html',
        controller: 'PipelineSetupCtrl',
        resolve: {
          initialData: ['SalesPipelineStagesService', function (SalesPipelineStagesService) {
            return SalesPipelineStagesService.list().then(function (promise) {
              return {stages: promise.data};
            });
          }]
        }
      })
      .when('/attachments', {
        title: 'ATTACHMENTS',
        templateUrl: 'views/attachments.html',
        controller: 'AttachmentsCtrl'
      })
      .when('/contract', {
        title: 'PAGE_TITLE',
        templateUrl: 'views/contract.html',
        controller: 'ContractCtrl'
      })
      .when('/contracts', {
        title: 'PAGE_TITLE',
        templateUrl: 'views/contracts.html',
        controller: 'ContractsCtrl'
      })
      .when('/user', {
        title: 'PAGE_TITLE',
        templateUrl: 'views/user.html',
        controller: 'UserCtrl'
      })
      .otherwise({
        redirectTo: '/error'
      });

    // Spinner
    //cfpLoadingBarProvider.includeSpinner = true;

    // Locale and translate
    $translateProvider.useSanitizeValueStrategy(null);
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: 'translations/{lang}/{part}.json'
    });
    $translateProvider.preferredLanguage('en-us');
    tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');

    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    //datepicker
    //uibDatepickerConfig.format = 'dd.MM.yy';
    uibDatepickerConfig.startingDay = 1;

    // TextAngular
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
      taOptions.forceTextAngularSanitize = false;
      taOptions.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'p'], /*'h5', 'h6', 'pre', 'quote'*/
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        ['redo', 'undo', 'clear']
        /* ['insertImage', 'insertLink', 'insertVideo' ]*/
        /* ['html', 'wordcount', 'charcount'] */
      ];
      return taOptions;
    }]);
  })
  .run(['$rootScope', '$locale', '$route', '$location', '$cookies', 'Meta', 'DateService', 'Language', function ($rootScope, $locale, $route, $location, $cookies, Meta, DateService, Language) {
    if ($cookies.isLogged && ['/', '/login'].indexOf($location.path()) > -1) {
      $location.path('/home');
    }

    // Translate change
    $rootScope.$on('$translateChangeSuccess', function () {
      // Datepicker
      DateService.setDatepicker();
    });

    // Locale i18n change
    $rootScope.$on('$localeChangeSuccess', function () {
      // set date format
      //DateService.setFormat($locale.DATETIME_FORMATS.mediumDate);
      DateService.setFormat('d.M.yyyy');
      DateService.setFormatTime($locale.DATETIME_FORMATS.shortTime);
    });

    $rootScope.$on('$locationChangeStart', function (event, nextUrl, currentUrl) {
      // set meta without path /login
      if (['/login', '/'].indexOf($location.path()) === -1 && $location.path() !== '') {
        // load Meta information (user, language atc.)
        var meta = Meta.setMetaInformations();
        if (!Language.getLanguage()) {
          event.preventDefault();
          if (meta) {
            meta.then(function (result) {
              $location.$$parse(nextUrl);
              if (nextUrl === currentUrl) {
                $route.reload();
              }
            });
          } else {
            $location.$$parse(nextUrl);
          }
        }
      }
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
      // set title and meta
      if (current.$$route) {
        $rootScope.title = current.$$route.title;
      }
      $rootScope.showFormChanges = false;
    });

  }]);
