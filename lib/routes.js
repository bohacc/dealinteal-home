/*global require, module,  __dirname */
/*jslint es5: true, indent: 2, node:true, nomen: true, maxlen: 80, vars: true*/
'use strict';

/**
 * @file user
 * @fileOverview __Server_ROUTE
 */

/**
 * @namespace __Server_ROUTE
 * @author Martin Boháč
 */
var env = process.env.NODE_ENV || 'development';

var api = require('./controllers/api'),
  path = require('path'),
  tools = require('./controllers/tools'),
  pdf = require('./controllers/pdf'),
  constants = require('./controllers/constants'),
  authentication = require('./controllers/authentication'),
  logging = require('./controllers/logging'),
  user = require('./controllers/users'),
  people = require('./controllers/people'),
  salesPipeline = require('./controllers/sales_pipeline'),
  salesPipelineStages = require('./controllers/sales_pipeline_stages'),
  companies = require('./controllers/companies'),
  countries = require('./controllers/countries'),
  positions = require('./controllers/positions'),
  roles = require('./controllers/roles'),
  appointment = require('./controllers/appointment'),
  timezones = require('./controllers/timezones'),
  reminders = require('./controllers/reminders'),
  connections = require('./controllers/connections'),
  agenda = require('./controllers/agenda'),
  tasks = require('./controllers/tasks'),
  projects = require('./controllers/projects'),
  salesPlan = require('./controllers/sales_plan'),
  peopleCompanies = require('./controllers/people_companies'),
  opportunities = require('./controllers/opportunities'),
  products = require('./controllers/products'),
  changelogs = require('./controllers/changelogs'),
  importCsv = require('./controllers/import_csv'),
  exportCsv = require('./controllers/export_csv'),
  exchange = require('./controllers/exchange_service'),
  multipart = require('connect-multiparty'),
  currency = require('./controllers/currency'),
  units = require('./controllers/units'),
  msExchange = require('./controllers/ms_exchange'),
  msWord = require('./controllers/ms_word'),
  attachments = require('./controllers/attachments'),
  permission = require('./controllers/permission'),
  texts = require('./controllers/texts'),
  multipartMiddleware = multipart();

module.exports = function (app) {
  app.post('/api/pre_login.html', function (req, res) {
    if ('development' == env) {
      res.sendFile('pre_login.html', {root: path.join(__dirname, '../app/views')});
    } else {
      res.sendFile('pre_login.html', {root: path.join(__dirname, '../dist/views')});
    }
  });

  app.get('/api/search/contacts/:str', people.searchStr);
  app.put('/api/user', user.update);
  app.get('/api/user', user.get);
  app.get('/api/users', user.list);
  app.get('/api/users/without-owner', user.listWithoutOwner);

  app.post('/api/admin/create-restrictions', permission.createRestrictions);
  app.post('/api/admin/create-restrictions/user', permission.createRestrictionsForUser);

  app.get('/api/people', people.list);
  app.get('/api/people/all/without-team/search/:search', people.listWithoutTeam);
  app.get('/api/people/all/search/:search', people.listSearch);
  app.get('/api/people/:id', people.get);
  app.get('/api/people/search/:search', people.search);
  app.get('/api/people/search-all/:str', people.searchGlobal);
  app.get('/api/people/team/search-all/:str', people.searchGlobalTeam);
  app.get('/api/people/login-user/home-address', people.homeAddress);
  app.get('/api/people/login-user/business-address', people.businessAddress);
  app.get('/api/people/login-user/latest-address', people.latestAddress);
  app.get('/api/people/login-user/all', people.loginUser);
  app.get('/api/people/login-user/emails', people.loginUserEmails);
  app.put('/api/people/:id', people.put);
  app.post('/api/people', people.post);
  app.post('/api/people/:tableId/picture/upload', multipartMiddleware, people.uploadPicture);
  app.delete('/api/people/:id', people.delete);
  app.get('/api/people/anniversary/count', people.anniversaryCount);
  app.get('/api/people/anniversary/list/today', people.anniversaryToday);
  app.get('/api/people/anniversary/list/tomorrow', people.anniversaryTomorrow);
  app.get('/api/people/anniversary/list/aftertomorrow', people.anniversaryAfterTomorrow);
  app.get('/api/people/anniversary/list/nextdays', people.anniversaryNextDays);

  app.get('/api/team-members', people.teamMembersList);

  app.get('/api/positions/:search', positions.list);
  app.get('/api/roles/:search', roles.list);

  app.get('/api/countries', countries.list);

  app.post('/api/log', logging.log);

  app.get('/api/sales-pipeline-stages', salesPipelineStages.list);
  app.get('/api/sales-pipeline/:id', salesPipeline.get);
  app.get('/api/sales-pipeline/my/stages', salesPipeline.listMyStages);
  app.post('/api/sales-pipeline/stages/', salesPipeline.stageList);
  app.get('/api/sales-pipeline/stages/:id', salesPipeline.stageInfo);
  app.get('/api/sales-pipeline/stages/all/owners/', salesPipeline.stageOwners);
  app.put('/api/sales-pipeline-stages/:id', salesPipelineStages.put);
  app.put('/api/sales-pipeline-stages/replace/:id', salesPipelineStages.replace);
  app.post('/api/sales-pipeline-stages', salesPipelineStages.post);
  app.delete('/api/sales-pipeline-stages/:id', salesPipelineStages.del);

  app.get('/api/companies/search/:search', companies.search);
  app.get('/api/companies', companies.list);
  app.get('/api/companies/:id', companies.get);
  app.get('/api/companies/:id/people', people.companyPeople);
  app.get('/api/companies/:id/opportunities', companies.companyOpportunities);
  app.post('/api/companies', function(req, res, next){
    companies.post(req, res, false);
  });
  app.put('/api/companies/:id', companies.put);
  app.delete('/api/companies/:id', companies.delete);
  app.get('/api/companies/search-all/:str', companies.searchGlobal);
  app.get('/api/companies/:id/sales-pipeline/all/:search', companies.salesPipeline);
  app.post('/api/companies/export/excel', companies.exportExcel);
  app.get('/api/companies/export/excel', companies.exportExcel);

  app.get('/api/appointments/calendar/current', appointment.listForCalendar);
  app.get('/api/appointments/calendar/current/:person', appointment.listForCalendar);
  app.get('/api/appointments/:id', appointment.get);
  app.get('/api/appointment/types', appointment.types);
  app.get('/api/appointment/places', appointment.places);
  app.get('/api/appointment/tags', appointment.tags);
  app.get('/api/appointment/login-user/next-free-time', appointment.nextFreeTime);
  app.get('/api/appointments', appointment.list);
  app.post('/api/appointments', appointment.post);
  app.delete('/api/appointments/:id', appointment.del);
  app.put('/api/appointments/:id', appointment.put);
  app.put('/api/appointments/:id/calendar', appointment.putFromCalendar);

  app.get('/api/timezones', timezones.list);

  app.get('/api/reminders', reminders.list);
  app.get('/api/reminders/calendar/current', reminders.listForCalendar);
  app.get('/api/reminders/calendar/current/:person', reminders.listForCalendar);
  app.get('/api/reminder/:id', reminders.get);
  app.post('/api/reminder', reminders.post);
  app.post('/api/reminder/:id/mark-as-done', reminders.markAsDone);
  app.put('/api/reminder/:id', reminders.put);
  app.put('/api/reminder/:id/calendar', reminders.putFromCalendar);
  app.delete('/api/reminder/:id', reminders.del);

  app.get('/api/agenda/week/:date', agenda.listForWeek);
  app.get('/api/agenda/list/opportunity/:id', agenda.listForOpportunity);
  app.get('/api/agenda/list/person/:id', agenda.listForPerson);
  app.get('/api/agenda/list/company/:id', agenda.listForCompany);
  app.get('/api/agenda/list/project/:id', agenda.listForProject);
  app.post('/api/agenda/email', agenda.sendEmail);

  // Tasks
  app.get('/api/tasks/:id', tasks.get);
  app.get('/api/tasks', tasks.list);
  app.get('/api/tasks/tags/all', tasks.tags);
  app.post('/api/tasks', tasks.post);
  app.post('/api/tasks/:id/mark-as-done', tasks.markAsDone);
  app.put('/api/tasks/:id', tasks.put);
  app.delete('/api/tasks/:id', tasks.del);
  app.get('/api/tasks/:id/related/all', tasks.relatedList);
  app.get('/api/tasks/:id/related/preceding', tasks.relatedPrecedingList);
  app.get('/api/tasks/:id/related/following', tasks.relatedFollowingList);
  app.get('/api/tasks/user/count', tasks.userCount);
  app.get('/api/tasks/user/list/old/:limit', tasks.userListOld);
  app.get('/api/tasks/user/list/today/:limit', tasks.userListToday);
  app.get('/api/tasks/user/list/tomorrow/:limit', tasks.userListTomorrow);
  app.get('/api/tasks/user/list/new/:limit', tasks.userListNew);
  app.get('/api/tasks/appointment/:id', tasks.listForAppointment);

  app.get('/api/sales-plan/filter/years', salesPlan.yearsForFilter);
  app.get('/api/sales-plan/filter/months', salesPlan.monthsForFilter);
  app.get('/api/sales-plan/filter/quarter', salesPlan.quarterForFilter);
  app.get('/api/sales-plan/my-company', salesPlan.sumForCompany);
  app.get('/api/sales-plan/domain', salesPlan.sumForDomain);
  app.get('/api/sales-plan/personal', salesPlan.sumForPersonal);
  app.get('/api/sales-plan/products/group/company', salesPlan.listCompanyGroup);
  app.get('/api/sales-plan/products/group/product', salesPlan.listProductGroup);

  app.delete('/api/people-companies/company/:id/people/:people', peopleCompanies.deletePeople);

  app.get('/api/opportunities', opportunities.list);
  app.get('/api/opportunities/:id', opportunities.get);
  app.get('/api/opportunities/:id/items', opportunities.listItems);
  app.get('/api/opportunity/tags', opportunities.tags);
  app.get('/api/opportunities/:id/history', opportunities.history);
  app.put('/api/opportunities/:id', opportunities.put);
  app.put('/api/opportunities/:id/item/:number', opportunities.putItem);
  app.delete('/api/opportunities/:id', opportunities.del);
  app.delete('/api/opportunities/:id/item/:number', opportunities.delItem);
  app.post('/api/opportunities', opportunities.post);
  app.post('/api/opportunities/:id/item', opportunities.postItem);
  app.get('/api/opportunity/search-all/:str', opportunities.searchGlobal);

  app.put('/api/opportunities/:id/success', opportunities.success);
  app.put('/api/opportunities/:id/failed', opportunities.failed);
  app.put('/api/opportunities/:id/open', opportunities.open);

  app.get('/api/projects', projects.list);
  app.get('/api/projects/search/:search', projects.search);
  app.get('/api/projects/search-all/:str', projects.searchGlobal);
  app.get('/api/project/:id', projects.get);
  app.put('/api/project/:id', projects.put);
  app.post('/api/project', projects.post);
  app.delete('/api/project/:id', projects.delete);
  app.get('/api/project/:id/history', projects.history);

  app.get('/api/products', products.list);
  app.get('/api/products/search/:search', products.search);
  app.get('/api/product/:id', products.get);
  app.put('/api/product/:id', products.put);
  app.post('/api/product', products.post);
  app.delete('/api/product/:id', products.delete);
  app.post('/api/product/:tableId/picture/upload', multipartMiddleware, products.uploadPicture);

  app.get('/api/changelogs', changelogs.list);

  app.get('/api/currency', currency.list);
  app.get('/api/units', units.list);

  app.get('/api/pdf', pdf.create);

  app.post('/api/login', connections.connect);
  app.get('/api/logout', authentication.logout);
  app.post('/api/user/create', user.create);

  app.post('/api/authentication/alive', authentication.alive);

  // IMPORT / EXPORT
  app.post('/api/exchange/v1/schema', exchange.schema);
  // Countries
  app.post('/api/exchange/v1/schema/countries', exchange.schemaCountries);
  app.post('/api/exchange/v1/countries', exchange.countries);
  app.post('/api/exchange/v1/countries/get/:id', exchange.countries);
  app.post('/api/exchange/v1/countries/create', exchange.countriesPost);
  app.post('/api/exchange/v1/countries/update/:id', exchange.countriesPut);
  app.post('/api/exchange/v1/countries/all/delete', exchange.countriesAllDelete);
  app.post('/api/exchange/v1/countries/delete/:id', exchange.countriesDelete);
  // Companies
  app.post('/api/exchange/v1/schema/companies', exchange.schemaCompanies);
  app.post('/api/exchange/v1/companies', exchange.companies);
  app.post('/api/exchange/v1/companies/get/:id', exchange.companies);
  app.post('/api/exchange/v1/companies/create', exchange.companiesPost);
  app.post('/api/exchange/v1/companies/update/:id', exchange.companiesPut);
  app.post('/api/exchange/v1/companies/delete/:id', exchange.companiesDelete);
  // People
  app.post('/api/exchange/v1/schema/people', exchange.schemaPeople);
  app.post('/api/exchange/v1/people', exchange.people);
  app.post('/api/exchange/v1/people/get/:id', exchange.people);
  app.post('/api/exchange/v1/people/create', exchange.peoplePost);
  app.post('/api/exchange/v1/people/update/:id', exchange.peoplePut);
  app.post('/api/exchange/v1/people/delete/:id', exchange.peopleDelete);
  // People Companies
  app.post('/api/exchange/v1/schema/people-companies', exchange.schemaPeopleCompanies);
  app.post('/api/exchange/v1/people-companies', exchange.peopleCompanies);
  app.post('/api/exchange/v1/people/:people/companies', exchange.peopleCompanies);
  app.post('/api/exchange/v1/people/:people/companies/:company', exchange.peopleCompanies);
  app.post('/api/exchange/v1/companies/:company/people', exchange.peopleCompanies);
  app.post('/api/exchange/v1/companies/:company/people/:people', exchange.peopleCompanies);
  app.post('/api/exchange/v1/people-companies/create', exchange.peopleCompaniesPost);
  app.post('/api/exchange/v1/people-companies/people/:people/company/:company/update', exchange.peopleCompaniesPut);
  app.post('/api/exchange/v1/people-companies/people/:people/company/:company/delete', exchange.peopleCompaniesDelete);
  // Products
  app.post('/api/exchange/v1/schema/products', exchange.schemaProducts);
  app.post('/api/exchange/v1/products', exchange.products);
  app.post('/api/exchange/v1/products/get/:id', exchange.products);
  app.post('/api/exchange/v1/products/create', exchange.productsPost);
  app.post('/api/exchange/v1/products/update/:id', exchange.productsPut);
  app.post('/api/exchange/v1/products/delete/:id', exchange.productsDelete);
  app.post('/api/exchange/v1/products/all/delete', exchange.productsAllDelete);
  // Balance
  app.post('/api/exchange/v1/schema/balance', exchange.schemaBalance);
  app.post('/api/exchange/v1/balance/create', exchange.balancePost);
  app.post('/api/exchange/v1/balance/all/delete', exchange.balanceAllDelete);
  // Sales
  app.post('/api/exchange/v1/schema/sales', exchange.schemaSales);
  app.post('/api/exchange/v1/sales/create', exchange.salesPost);
  app.post('/api/exchange/v1/sales/update/:id', exchange.salesPut);
  app.post('/api/exchange/v1/sales/delete/:id', exchange.salesDelete);
  app.post('/api/exchange/v1/sales/all/delete', exchange.salesAllDelete);
  app.post('/api/exchange/v1/sales/document/delete/:id', exchange.salesDocumentDelete);
  // Currency
  app.post('/api/exchange/v1/schema/currency', exchange.schemaCurrency);
  app.post('/api/exchange/v1/currency', exchange.currency);
  app.post('/api/exchange/v1/currency/get/:code', exchange.currency);
  app.post('/api/exchange/v1/currency/create', exchange.currencyPost);
  // Units
  app.post('/api/exchange/v1/schema/units', exchange.schemaUnits);
  app.post('/api/exchange/v1/units', exchange.units);
  app.post('/api/exchange/v1/units/get/:code', exchange.units);
  app.post('/api/exchange/v1/units/create', exchange.unitsPost);
  // Company groups
  app.post('/api/exchange/v1/schema/company-groups', exchange.schemaCompanyGroups);
  app.post('/api/exchange/v1/company-groups', exchange.companyGroups);
  app.post('/api/exchange/v1/company-groups/get/:id', exchange.companyGroups);
  app.post('/api/exchange/v1/company-groups/create', exchange.companyGroupsPost);

  // CSV - IMPORT
  app.post('/api/import/csv/v1/companies-import-csv-v1', multipartMiddleware, importCsv.companiesPost);
  app.get('/api/import/csv/v1/companies-import-csv-v1', importCsv.companiesGet);

  // CSV - EXPORT
  app.get('/api/export/csv/v1/companies', exportCsv.companies);

  // MS Exchange
  app.get('/api/ms-exchange-authorize', msExchange.loginUrl);
//  app.get('/api/ms-authorize', msExchange.authorize);
  app.get('/api/ms-mail', msExchange.showMail);
  app.get('/api/ms-calendar', msExchange.showCalendar);
  app.get('/api/ms-contacts', msExchange.showContacts);
  app.get('/api/ms-tasks', msExchange.showTasks);

  // MS Word
  app.get('/api/ms-word/appointments/:id', msWord.appointments);

  // Attachments
  app.get('/api/attachments', attachments.list);
  app.post('/api/attachments/upload/:table/:tableId', multipartMiddleware, attachments.uploadFile);
  app.get('/api/attachments/:id', attachments.get);
  app.delete('/api/attachments/:id', attachments.deleteFile);

  // Texts
  app.delete('/api/texts/:id', texts.delete);

  app.get('/api/exchange/*', exchange.schema);
};
