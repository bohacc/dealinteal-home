/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 16.10.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file export_csv
 * @fileOverview __Server_REST_API_ExportCSVService
 */

/**
 * @namespace __Server_REST_API_ExportCSVService
 * @author Martin Boháč
 */
var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_ExportCSVService
 * @method
 * @name companies
 * @description export companies to CSV
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companies = function (req, res) {
  // !!! Dořešit escapovani oddělovače v textu, přes javascript strašně pomalý
  // !!! Dořešit maximální velikost odesílaného souboru, při cca 32MB pada server
  var sql, filename = 'companies_dealinteal.csv', expStr, i, l, sep = constants.EXPORT_CSV_SEPARATOR;
  sql =
    'select ' +
    '  c.id, ' +
    '  c.reg_id, ' +
    '  c.vat_id, ' +
    '  (c.company_name) as company_name, ' +
    '  c.company_group, ' +
    '  (c.address_tag_1) as address_tag_1, ' +
    '  (c.address_street_1) as address_street_1, ' +
    '  (c.address_city_1) as address_city_1, ' +
    '  (c.address_zip_1) as address_zip_1, ' +
    '  (c.address_region_1) as address_region_1, ' +
    '  (c.phone_1_1) as phone_1_1, ' +
    '  (c.phone_1_1_tag) as phone_1_1_tag, ' +
    '  (c.phone_1_2) as phone_1_2, ' +
    '  (c.phone_1_2_tag) as phone_1_2_tag, ' +
    '  (c.phone_1_3) as phone_1_3, ' +
    '  (c.phone_1_3_tag) as phone_1_3_tag, ' +
    '  (c.email_1_1) as email_1_1, ' +
    '  (c.email_1_1_tag) as email_1_1_tag, ' +
    '  (c.email_1_2) as email_1_2, ' +
    '  (c.email_1_2_tag) as email_1_2_tag, ' +
    '  (c.email_1_3) as email_1_3, ' +
    '  (c.email_1_3_tag) as email_1_3_tag, ' +
    '  (c.fax_1_1) as fax_1_1, ' +
    '  (c.fax_1_1_tag) as fax_1_1_tag, ' +
    '  (c.fax_1_2) as fax_1_2, ' +
    '  (c.fax_1_2_tag) as fax_1_2_tag, ' +
    '  (c.address_tag_2) as address_tag_2, ' +
    '  (c.address_street_2) as address_street_2, ' +
    '  (c.address_city_2) as address_city_2, ' +
    '  (c.address_zip_2) as address_zip_2, ' +
    '  (c.address_region_2) as address_region_2, ' +
    '  (c.phone_2_1) as phone_2_1, ' +
    '  (c.phone_2_1_tag) as phone_2_1_tag, ' +
    '  (c.phone_2_2) as phone_2_2, ' +
    '  (c.phone_2_2_tag) as phone_2_2_tag, ' +
    '  (c.phone_2_3) as phone_2_3, ' +
    '  (c.phone_2_3_tag) as phone_2_3_tag, ' +
    '  (c.email_2_1) as email_2_1, ' +
    '  (c.email_2_1_tag) as email_2_1_tag, ' +
    '  (c.email_2_2) as email_2_2, ' +
    '  (c.email_2_2_tag) as email_2_2_tag, ' +
    '  (c.email_2_3) as email_2_3, ' +
    '  (c.email_2_3_tag) as email_2_3_tag, ' +
    '  (c.fax_2_1) as fax_2_1, ' +
    '  (c.fax_2_1_tag) as fax_2_1_tag, ' +
    '  (c.fax_2_2) as fax_2_2, ' +
    '  (c.fax_2_2_tag) as fax_2_2_tag, ' +
    '  (c.address_tag_3) as address_tag_3, ' +
    '  (c.address_street_3) as address_street_3, ' +
    '  (c.address_city_3) as address_city_3, ' +
    '  (c.address_zip_3) as address_zip_3, ' +
    '  (c.address_region_3) as address_region_3, ' +
    '  (c.phone_3_1) as phone_3_1, ' +
    '  (c.phone_3_1_tag) as phone_3_1_tag, ' +
    '  (c.phone_3_2) as phone_3_2, ' +
    '  (c.phone_3_2_tag) as phone_3_2_tag, ' +
    '  (c.phone_3_3) as phone_3_3, ' +
    '  (c.phone_3_3_tag) as phone_3_3_tag, ' +
    '  (c.email_3_1) as email_3_1, ' +
    '  (c.email_3_1_tag) as email_3_1_tag, ' +
    '  (c.email_3_2) as email_3_2, ' +
    '  (c.email_3_2_tag) as email_3_2_tag, ' +
    '  (c.email_3_3) as email_3_3, ' +
    '  (c.email_3_3_tag) as email_3_3_tag, ' +
    '  (c.fax_3_1) as fax_3_1, ' +
    '  (c.fax_3_1_tag) as fax_3_1_tag, ' +
    '  (c.fax_3_2) as fax_3_2, ' +
    '  (c.fax_3_2_tag) as fax_3_2_tag, ' +
    '  (c.website_1) as website_1, ' +
    '  (c.website_2) as website_2, ' +
    '  (c.website_3) as website_3, ' +
    '  (c.facebook_1) as facebook_1, ' +
    '  (c.google_1) as google_1, ' +
    '  (c.twitter_1) as twitter_1, ' +
    '  c.category as category, ' +
    '  c.subcategory as subcategory, ' +
    '  c.address_country_1 as address_country_1, ' +
    '  c.address_country_2 as address_country_2, ' +
    '  c.address_country_3 as address_country_3, ' +
    '  (c.facebook_2) as facebook_2, ' +
    '  (c.google_2) as google_2, ' +
    '  (c.twitter_2) as twitter_2, ' +
    '  (c.facebook_3) as facebook_3, ' +
    '  (c.google_3) as google_3, ' +
    '  (c.twitter_3) as twitter_3, ' +
    '  c.rating, ' +
    '  p.id as people_id, ' +
    '  (p.title) as people_title, ' +
      //'  CASE WHEN position(\';\' in p.title) = 0 THEN p.title ELSE \'"\' || p.title || \'"\' END as people_title, ' +
    '  (p.first_name) as people_first_name, ' +
    '  (p.middle_name) as people_middle_name, ' +
    '  (p.last_name) as people_last_name, ' +
    '  (p.suffix) as people_suffix, ' +
    '  (p.nickname) as people_nickname, ' +
    '  null as people_picture, ' +
    '  (p.manager_name) as people_manager_name, ' +
    '  (p.assistant_name) as people_assistant_name, ' +
    '  (p.spouse) as people_spouse, ' +
    '  (p.children) as people_children, ' +
    '  p.birthday as people_birthday, ' +
    '  p.anniversary as people_anniversary, ' +
    '  (p.anniversary_name) as people_anniversary_name, ' +
    '  (p.gender) as people_gender, ' +
    '  (p.hobbies) as people_hobbies, ' +
    '  (p.business_addr_name) as people_business_addr_name, ' +
    '  (p.business_addr_street) as people_business_addr_street, ' +
    '  (p.business_addr_city) as people_business_addr_city, ' +
    '  (p.business_addr_zip) as people_business_addr_zip, ' +
    '  (p.business_addr_region) as people_business_addr_region, ' +
    '  (p.home_addr_name) as people_home_addr_name, ' +
    '  (p.home_addr_street) as people_home_addr_street, ' +
    '  (p.home_addr_city) as people_home_addr_city, ' +
    '  (p.home_addr_zip) as people_home_addr_zip, ' +
    '  (p.home_addr_region) as people_home_addr_region, ' +
    '  (p.other_addr_name) as people_other_addr_name, ' +
    '  (p.other_addr_street) as people_other_addr_street, ' +
    '  (p.other_addr_city) as people_other_addr_city, ' +
    '  (p.other_addr_zip) as people_other_addr_zip, ' +
    '  (p.other_addr_region) as people_other_addr_region, ' +
    '  (p.email) as people_email, ' +
    '  (p.email2) as people_email2, ' +
    '  (p.skype) as people_skype, ' +
    '  (p.other_im) as people_other_im, ' +
    '  (p.linkedin) as people_linkedin, ' +
    '  (p.twitter) as people_twitter, ' +
    '  (p.facebook) as people_facebook, ' +
    '  (p.business_phone) as people_business_phone, ' +
    '  (p.assistant_phone) as people_assistant_phone, ' +
    '  (p.home_phone) as people_home_phone, ' +
    '  (p.mobile_phone) as people_mobile_phone, ' +
    '  (p.other_phone) as people_other_phone, ' +
    '  (p.fax) as people_fax, ' +
    '  p.team_member as people_team_member, ' +
    '  p.private as people_private, ' +
    '  (p.note) as people_note, ' +
    '  (p.note_author) as people_note_author, ' +
    '  p.note_date as people_note_date, ' +
    '  (p.user_field_1) as people_user_field_1, ' +
    '  (p.user_field_2) as people_user_field_2, ' +
    '  (p.user_field_3) as people_user_field_3, ' +
    '  (p.user_field_4) as people_user_field_4, ' +
    '  (p.user_field_5) as people_user_field_5, ' +
    '  (p.user_field_6) as people_user_field_6, ' +
    '  (p.user_field_7) as people_user_field_7, ' +
    '  (p.user_field_8) as people_user_field_8, ' +
    '  (p.user_field_9) as people_user_field_9, ' +
    '  (p.user_field_10) as people_user_field_10, ' +
    '  p.business_addr_country as people_business_addr_country, ' +
    '  p.home_addr_country as people_home_addr_country, ' +
    '  p.other_addr_country as people_other_addr_country, ' +
    '  (p.google_plus) as people_google_plus ' +
    /*'  p.last_date as people_last_date, ' +
    '  p.last_user as people_last_user ' +*/
    'from ' +
    '  companies c ' +
    '  LEFT JOIN ' +
    '  ( ' +
    '   select ' +
    '     min(pc.people_id) as people_id, ' +
    '     pc.companies_id ' +
    '   from ' +
    '     people_companies pc ' +
      //'     LEFT JOIN people p ON pc.people_id = p.id ' +
    '   group by ' +
    '     pc.companies_id ' +
    '  ) pc ' +
    '  ON c.id = pc.companies_id ' +
    '  LEFT JOIN people p ON pc.people_id = p.id '; // +
  //'limit 1000 ';

  res.set({
    'Content-Type': constants.CONTENT_TYPE_CSV,
    'Content-disposition': constants.CONTENT_DISPOSITION + filename
  });

  expStr =
    'id' + sep +
    'reg_id' + sep +
    'vat_id' + sep +
    'company_name' + sep +
    'company_group' + sep +
    'address_tag_1' + sep +
    'address_street_1' + sep +
    'address_city_1' + sep +
    'address_zip_1' + sep +
    'address_region_1' + sep +
    'phone_1_1' + sep +
    'phone_1_1_tag' + sep +
    'phone_1_2' + sep +
    'phone_1_2_tag' + sep +
    'phone_1_3' + sep +
    'phone_1_3_tag' + sep +
    'email_1_1' + sep +
    'email_1_1_tag' + sep +
    'email_1_2' + sep +
    'email_1_2_tag' + sep +
    'email_1_3' + sep +
    'email_1_3_tag' + sep +
    'fax_1_1' + sep +
    'fax_1_1_tag' + sep +
    'fax_1_2' + sep +
    'fax_1_2_tag' + sep +
    'address_tag_2' + sep +
    'address_street_2' + sep +
    'address_city_2' + sep +
    'address_zip_2' + sep +
    'address_region_2' + sep +
    'phone_2_1' + sep +
    'phone_2_1_tag' + sep +
    'phone_2_2' + sep +
    'phone_2_2_tag' + sep +
    'phone_2_3' + sep +
    'phone_2_3_tag' + sep +
    'email_2_1' + sep +
    'email_2_1_tag' + sep +
    'email_2_2' + sep +
    'email_2_2_tag' + sep +
    'email_2_3' + sep +
    'email_2_3_tag' + sep +
    'fax_2_1' + sep +
    'fax_2_1_tag' + sep +
    'fax_2_2' + sep +
    'fax_2_2_tag' + sep +
    'address_tag_3' + sep +
    'address_street_3' + sep +
    'address_city_3' + sep +
    'address_zip_3' + sep +
    'address_region_3' + sep +
    'phone_3_1' + sep +
    'phone_3_1_tag' + sep +
    'phone_3_2' + sep +
    'phone_3_2_tag' + sep +
    'phone_3_3' + sep +
    'phone_3_3_tag' + sep +
    'email_3_1' + sep +
    'email_3_1_tag' + sep +
    'email_3_2' + sep +
    'email_3_2_tag' + sep +
    'email_3_3' + sep +
    'email_3_3_tag' + sep +
    'fax_3_1' + sep +
    'fax_3_1_tag' + sep +
    'fax_3_2' + sep +
    'fax_3_2_tag' + sep +
    'website_1' + sep +
    'website_2' + sep +
    'website_3' + sep +
    'facebook_1' + sep +
    'google_1' + sep +
    'twitter_1' + sep +
    'category' + sep +
    'subcategory' + sep +
    'address_country_1' + sep +
    'address_country_2' + sep +
    'address_country_3' + sep +
    'facebook_2' + sep +
    'google_2' + sep +
    'twitter_2' + sep +
    'facebook_3' + sep +
    'google_3' + sep +
    'twitter_3' + sep +
    'rating' + sep +
    /*'last_date' + sep +
    'last_user' + sep +*/
      // PEOPLE
    'people_id' + sep +
    'people_title' + sep +
    'people_first_name' + sep +
    'people_middle_name' + sep +
    'people_last_name' + sep +
    'people_suffix' + sep +
    'people_nickname' + sep +
    'people_picture' + sep +
    'people_manager_name' + sep +
    'people_assistant_name' + sep +
    'people_spouse' + sep +
    'people_children' + sep +
    'people_birthday' + sep +
    'people_anniversary' + sep +
    'people_anniversary_name' + sep +
    'people_gender' + sep +
    'people_hobbies' + sep +
    'people_business_addr_name' + sep +
    'people_business_addr_street' + sep +
    'people_business_addr_city' + sep +
    'people_business_addr_zip' + sep +
    'people_business_addr_region' + sep +
    'people_home_addr_name' + sep +
    'people_home_addr_street' + sep +
    'people_home_addr_city' + sep +
    'people_home_addr_zip' + sep +
    'people_home_addr_region' + sep +
    'people_other_addr_name' + sep +
    'people_other_addr_street' + sep +
    'people_other_addr_city' + sep +
    'people_other_addr_zip' + sep +
    'people_other_addr_region' + sep +
    'people_email' + sep +
    'people_email2' + sep +
    'people_skype' + sep +
    'people_other_im' + sep +
    'people_linkedin' + sep +
    'people_twitter' + sep +
    'people_facebook' + sep +
    'people_business_phone' + sep +
    'people_assistant_phone' + sep +
    'people_home_phone' + sep +
    'people_mobile_phone' + sep +
    'people_other_phone' + sep +
    'people_fax' + sep +
    'people_team_member' + sep +
    'people_private' + sep +
    'people_note' + sep +
    'people_note_author' + sep +
    'people_note_date' + sep +
    'people_user_field_1' + sep +
    'people_user_field_2' + sep +
    'people_user_field_3' + sep +
    'people_user_field_4' + sep +
    'people_user_field_5' + sep +
    'people_user_field_6' + sep +
    'people_user_field_7' + sep +
    'people_user_field_8' + sep +
    'people_user_field_9' + sep +
    'people_user_field_10' + sep +
    'people_business_addr_country' + sep +
    'people_home_addr_country' + sep +
    'people_other_addr_country' + sep +
    'people_google_plus' + '\n'; //sep +
    /*'people_last_date' + sep +
    'people_last_user' + '\n';*/

  postgres.select(sql, [], req).then(
    function (result) {
      //console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXX');
      if (result && result.rows) {
        for (i = 0, l = result.rows.length; i < l; i += 1) {
          //console.log('BEGIN ----------------------');
          if (i > 0) {
            expStr = '';
          }
          try {
            expStr += tools.replaceCsv(result.rows[i].id, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].reg_id, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].vat_id, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].company_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].company_group, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_tag_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_street_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_city_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_zip_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_region_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_1_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_1_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_1_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_1_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_1_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_1_3_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_1_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_1_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_1_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_1_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_1_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_1_3_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_1_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_1_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_1_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_1_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_tag_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_street_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_city_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_zip_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_region_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_2_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_2_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_2_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_2_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_2_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_2_3_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_2_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_2_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_2_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_2_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_2_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_2_3_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_2_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_2_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_2_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_2_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_tag_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_street_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_city_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_zip_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_region_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_3_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_3_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_3_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_3_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_3_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].phone_3_3_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_3_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_3_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_3_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_3_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_3_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].email_3_3_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_3_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_3_1_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_3_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].fax_3_2_tag, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].website_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].website_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].website_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].facebook_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].google_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].twitter_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].category, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].subcategory, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_country_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_country_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].address_country_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].facebook_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].google_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].twitter_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].facebook_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].google_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].twitter_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].rating, sep);
            expStr += sep;
            /*expStr += tools.replaceCsv(result.rows[i].last_date, sep);
             expStr += sep;
             expStr += tools.replaceCsv(result.rows[i].last_user, sep);
             expStr += sep;*/
            // PEOPLE
            expStr += tools.replaceCsv(result.rows[i].people_id, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_title, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_first_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_middle_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_last_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_suffix, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_nickname, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_picture, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_manager_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_assistant_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_spouse, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_children, sep);
            expStr += sep;
            expStr += (result.rows[i].people_birthday ? result.rows[i].people_birthday.toISOString() : '');
            expStr += sep;
            expStr += (result.rows[i].people_anniversary ? result.rows[i].people_anniversary.toISOString() : '');
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_anniversary_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_gender, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_hobbies, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_business_addr_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_business_addr_street, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_business_addr_city, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_business_addr_zip, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_business_addr_region, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_home_addr_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_home_addr_street, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_home_addr_city, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_home_addr_zip, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_home_addr_region, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_addr_name, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_addr_street, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_addr_city, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_addr_zip, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_addr_region, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_email, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_email2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_skype, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_im, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_linkedin, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_twitter, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_facebook, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_business_phone, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_assistant_phone, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_home_phone, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_mobile_phone, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_phone, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_fax, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_team_member, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_private, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_note, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_note_author, sep);
            expStr += sep;
            expStr += (result.rows[i].people_note_date ? result.rows[i].people_note_date.toISOString() : '');
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_1, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_2, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_3, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_4, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_5, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_6, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_7, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_8, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_9, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_user_field_10, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_business_addr_country, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_home_addr_country, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_other_addr_country, sep);
            expStr += sep;
            expStr += tools.replaceCsv(result.rows[i].people_google_plus, sep);
            /*expStr += sep;
             expStr += tools.replaceCsv(result.rows[i].people_last_date);
             expStr += sep;
             expStr += tools.replaceCsv(result.rows[i].people_last_user);*/
            expStr += '\n';
          } catch (e) {
            console.log(e);
          }

          //console.log('WRITE ----------------------' + i);
          res.write(expStr);
        }
      }
      res.end();
    },
    function (result) {
      res.send('error with export to csv');
    }
  );
};