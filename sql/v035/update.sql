CREATE LANGUAGE plpgsql;

alter table countries add last_date timestamp without time zone NOT NULL default current_timestamp;
alter table countries add last_user character varying(30) NOT NULL default upper(current_user);

--alter table countries add constraint fk_countries_last_user foreign key (id) references users_login;

CREATE OR REPLACE FUNCTION check_countries_change() RETURNS trigger AS $emp_stamp$
    BEGIN
        NEW.last_date := current_timestamp;
        NEW.last_user := COALESCE(NEW.last_user, upper(current_user));
        RETURN NEW;
    END;
$emp_stamp$ LANGUAGE plpgsql;

CREATE TRIGGER check_insert_update
    BEFORE INSERT OR UPDATE ON countries
    FOR EACH ROW
    EXECUTE PROCEDURE check_countries_change();

create table balance
(
  company_id numeric(9),
  sign numeric(1),
  origin_date date,
  due_date date,
  payment_date date,
  document character varying(20),
  amount numeric(17,2),
  balance numeric(17,2),
  currency character varying(3),
  rate numeric(9,6),
  amount_common numeric(17,2),
  balance_common numeric(17,2));

alter table balance add
  constraint fk_balance_company_id foreign key (company_id) references companies;

alter table balance add
  constraint fk_balance_currency foreign key (currency) references currency;

alter table companies add last_date timestamp without time zone NOT NULL default current_timestamp;
alter table companies add last_user character varying(30) NOT NULL default upper(current_user);

--alter table companies add constraint fk_companies_last_user foreign key (id) references users_login;

CREATE OR REPLACE FUNCTION check_companies_change() RETURNS trigger AS $emp_stamp$
    BEGIN
        NEW.last_date := current_timestamp;
        NEW.last_user := COALESCE(NEW.last_user, upper(current_user));
        RETURN NEW;
    END;
$emp_stamp$ LANGUAGE plpgsql;

CREATE TRIGGER check_insert_update
    BEFORE INSERT OR UPDATE ON companies
    FOR EACH ROW
    EXECUTE PROCEDURE check_companies_change();

alter table people add last_date timestamp without time zone NOT NULL default current_timestamp;
alter table people add last_user character varying(30) NOT NULL default upper(current_user);

--alter table people add constraint fk_people_last_user foreign key (id) references users_login;

CREATE OR REPLACE FUNCTION check_people_change() RETURNS trigger AS $emp_stamp$
    BEGIN
        NEW.last_date := current_timestamp;
        NEW.last_user := COALESCE(NEW.last_user, upper(current_user));
        RETURN NEW;
    END;
$emp_stamp$ LANGUAGE plpgsql;

CREATE TRIGGER check_insert_update
    BEFORE INSERT OR UPDATE ON people
    FOR EACH ROW
    EXECUTE PROCEDURE check_people_change();

alter table people_companies add last_date timestamp without time zone NOT NULL default current_timestamp;
alter table people_companies add last_user character varying(30) NOT NULL default upper(current_user);

CREATE OR REPLACE FUNCTION check_people_companies_change() RETURNS trigger AS $emp_stamp$
    BEGIN
        NEW.last_date := current_timestamp;
        NEW.last_user := COALESCE(NEW.last_user, upper(current_user));
        RETURN NEW;
    END;
$emp_stamp$ LANGUAGE plpgsql;

CREATE TRIGGER check_insert_update
    BEFORE INSERT OR UPDATE ON people_companies
    FOR EACH ROW
    EXECUTE PROCEDURE check_people_companies_change();

CREATE TABLE companies_import_csv_v1
(
  id numeric(9,0) NOT NULL,
  reg_id character varying(20),
  vat_id character varying(20),
  company_name character varying(255) NOT NULL,
  company_group character varying(100),
  address_tag_1 character varying(100),
  address_street_1 character varying(100),
  address_city_1 character varying(100),
  address_zip_1 character varying(20),
  address_region_1 character varying(100),
  phone_1_1 character varying(30),
  phone_1_1_tag character varying(100),
  phone_1_2 character varying(30),
  phone_1_2_tag character varying(100),
  phone_1_3 character varying(30),
  phone_1_3_tag character varying(100),
  email_1_1 character varying(100),
  email_1_1_tag character varying(100),
  email_1_2 character varying(100),
  email_1_2_tag character varying(100),
  email_1_3 character varying(100),
  email_1_3_tag character varying(100),
  fax_1_1 character varying(30),
  fax_1_1_tag character varying(100),
  fax_1_2 character varying(30),
  fax_1_2_tag character varying(100),
  address_tag_2 character varying(100),
  address_street_2 character varying(100),
  address_city_2 character varying(100),
  address_zip_2 character varying(20),
  address_region_2 character varying(100),
  phone_2_1 character varying(30),
  phone_2_1_tag character varying(100),
  phone_2_2 character varying(30),
  phone_2_2_tag character varying(100),
  phone_2_3 character varying(30),
  phone_2_3_tag character varying(100),
  email_2_1 character varying(100),
  email_2_1_tag character varying(100),
  email_2_2 character varying(100),
  email_2_2_tag character varying(100),
  email_2_3 character varying(100),
  email_2_3_tag character varying(100),
  fax_2_1 character varying(30),
  fax_2_1_tag character varying(100),
  fax_2_2 character varying(30),
  fax_2_2_tag character varying(100),
  address_tag_3 character varying(100),
  address_street_3 character varying(100),
  address_city_3 character varying(100),
  address_zip_3 character varying(20),
  address_region_3 character varying(100),
  phone_3_1 character varying(30),
  phone_3_1_tag character varying(100),
  phone_3_2 character varying(30),
  phone_3_2_tag character varying(100),
  phone_3_3 character varying(30),
  phone_3_3_tag character varying(100),
  email_3_1 character varying(100),
  email_3_1_tag character varying(100),
  email_3_2 character varying(100),
  email_3_2_tag character varying(100),
  email_3_3 character varying(100),
  email_3_3_tag character varying(100),
  fax_3_1 character varying(30),
  fax_3_1_tag character varying(100),
  fax_3_2 character varying(30),
  fax_3_2_tag character varying(100),
  website_1 character varying(100),
  website_2 character varying(100),
  website_3 character varying(100),
  facebook_1 character varying(100),
  google_1 character varying(100),
  twitter_1 character varying(100),
  category character varying(100),
  subcategory character varying(100),
  address_country_1 character varying(100),
  address_country_2 character varying(100),
  address_country_3 character varying(100),
  facebook_2 character varying(100),
  google_2 character varying(100),
  twitter_2 character varying(100),
  facebook_3 character varying(100),
  google_3 character varying(100),
  twitter_3 character varying(100),
  rating numeric(2,0),
  last_date timestamp without time zone,
  last_user character varying(30),

  people_id numeric(9,0) NOT NULL,
  people_title character varying(100),
  people_first_name character varying(100),
  people_middle_name character varying(100),
  people_last_name character varying(100) NOT NULL,
  people_suffix character varying(40),
  people_nickname character varying(100),
  people_picture bytea,
  people_manager_name character varying(100),
  people_assistant_name character varying(100),
  people_spouse character varying(100),
  people_children character varying(100),
  people_birthday timestamp without time zone,
  people_anniversary date,
  people_anniversary_name character varying(100),
  people_gender character varying(10),
  people_hobbies character varying(100),
  people_business_addr_name character varying(100),
  people_business_addr_street character varying(100),
  people_business_addr_city character varying(100),
  people_business_addr_zip character varying(20),
  people_business_addr_region character varying(100),
  people_home_addr_name character varying(100),
  people_home_addr_street character varying(100),
  people_home_addr_city character varying(100),
  people_home_addr_zip character varying(20),
  people_home_addr_region character varying(100),
  people_other_addr_name character varying(100),
  people_other_addr_street character varying(100),
  people_other_addr_city character varying(100),
  people_other_addr_zip character varying(20),
  people_other_addr_region character varying(100),
  people_email character varying(100),
  people_email2 character varying(100),
  people_skype character varying(100),
  people_other_im character varying(100),
  people_linkedin character varying(100),
  people_twitter character varying(100),
  people_facebook character varying(100),
  people_business_phone character varying(100),
  people_assistant_phone character varying(100),
  people_home_phone character varying(100),
  people_mobile_phone character varying(100),
  people_other_phone character varying(100),
  people_fax character varying(100),
  people_team_member numeric(1,0),
  people_private numeric(1,0),
  people_note character varying(2000),
  people_note_author character varying(30),
  people_note_date date,
  people_user_field_1 character varying(30),
  people_user_field_2 character varying(30),
  people_user_field_3 character varying(30),
  people_user_field_4 character varying(30),
  people_user_field_5 character varying(30),
  people_user_field_6 character varying(30),
  people_user_field_7 character varying(30),
  people_user_field_8 character varying(30),
  people_user_field_9 character varying(30),
  people_user_field_10 character varying(30),
  people_business_addr_country character varying(100),
  people_home_addr_country character varying(100),
  people_other_addr_country character varying(100),
  people_google_plus character varying(100),
  people_last_date timestamp without time zone,
  people_last_user character varying(30)
  );