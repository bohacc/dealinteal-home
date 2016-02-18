-- Tohle zakladani jsem vubec nepouzil - pocitato se schematy a martin pocita s db - je treba to doresit
CREATE ROLE notia_admin LOGIN ENCRYPTED PASSWORD 'md5099ffcdea1f42703ca6825802465f094'
  SUPERUSER CREATEDB CREATEROLE
   VALID UNTIL 'infinity';

CREATE ROLE notia_user LOGIN ENCRYPTED PASSWORD 'md52d79bbc74eac1dba32cc4196745fc574'
   VALID UNTIL 'infinity';

CREATE TABLESPACE notia
  OWNER notia_admin
  LOCATION '/var/lib/pgsql/data/notia';

CREATE LANGUAGE plpgsql;

--connect as notia_admin

CREATE DATABASE dit_develop
  WITH ENCODING='UTF8'
       OWNER=notia_admin
       LC_COLLATE='en_US.UTF-8'
       LC_CTYPE='en_US.UTF-8'
       CONNECTION LIMIT=-1
       TABLESPACE=notia;
GRANT CONNECT, TEMPORARY ON DATABASE dit_develop TO public;
GRANT ALL ON DATABASE dit_develop TO postgres;
GRANT ALL ON DATABASE dit_develop TO developer;
COMMENT ON DATABASE dit_develop
  IS 'Databáze dit_develop Notia informační systémy, spol. s r.o.';


--CREATE SCHEMA notia
--  AUTHORIZATION notia_admin;
--GRANT USAGE ON SCHEMA notia TO notia_user;

--GRANT ALL ON SCHEMA notia TO notia_admin;
--GRANT ALL ON SCHEMA notia TO postgres;
--GRANT ALL ON SCHEMA notia TO public;
--COMMENT ON SCHEMA notia
--  IS 'notia schema';

-- connect as notia_admin

--SET search_path = notia;

-------------------
create table countries
(
  id numeric(9) not null,
  iso character varying(3),
  name_cz character varying(100),
  name_sk character varying(100),
  name_eng character varying(100));

alter table countries add
  constraint pk_countries primary key (id);

create unique index idx_countries_iso on countries (iso);

create sequence seq_countries_id;


-------------------
--DROP TABLE people cascade;
CREATE TABLE people
(
  id numeric(9) NOT NULL,
  title character varying(100),
  first_name character varying(100),
  middle_name character varying(100),
  last_name character varying(100) not null,
  suffix character varying(40),
  nickname character varying(100),
  picture bytea,
  manager_name character varying(100),
  assistant_name character varying(100),
  spouse character varying(100),
  children character varying(100),
  birthday date,
  anniversary date,
  anniversary_name character varying(100),
  gender character varying(10),
  hobbies character varying(100),
  business_addr_name character varying(100),
  business_addr_street character varying(100),
  business_addr_city character varying(100),
  business_addr_zip character varying(20),
  business_addr_region character varying(100),
  home_addr_name character varying(100),
  home_addr_street character varying(100),
  home_addr_city character varying(100),
  home_addr_zip character varying(20),
  home_addr_region character varying(100),
  other_addr_name character varying(100),
  other_addr_street character varying(100),
  other_addr_city character varying(100),
  other_addr_zip character varying(20),
  other_addr_region character varying(100),
  email character varying(100),
  email2 character varying(100),
  skype character varying(100),
  other_im character varying(100),
  linkedin character varying(100),
  twitter character varying(100),
  facebook character varying(100),
  business_phone character varying(100),
  assistant_phone character varying(100),
  home_phone character varying(100),
  mobile_phone character varying(100),
  other_phone character varying(100),
  fax character varying(100),
  team_member numeric(1),
  private numeric(1),
  note character varying(2000),
  note_author character varying(30),
  note_date date,
  user_field_1 character varying(30),
  user_field_2 character varying(30),
  user_field_3 character varying(30),
  user_field_4 character varying(30),
  user_field_5 character varying(30),
  user_field_6 character varying(30),
  user_field_7 character varying(30),
  user_field_8 character varying(30),
  user_field_9 character varying(30),
  user_field_10 character varying(30),
  business_addr_country numeric(9),
  home_addr_country numeric(9),
  other_addr_country numeric(9),
  google_plus character varying(100)
);

alter table people add
  CONSTRAINT pk_people PRIMARY KEY (id);

alter table people add
  constraint ck_people_team_member check (team_member in (0,1));
alter table people add
  constraint ck_people_private check (private in (0,1));
alter table people add
  constraint fk_people_bus_addr_country foreign key (business_addr_country) references countries;
alter table people add
  constraint fk_people_home_addr_country foreign key (home_addr_country) references countries;
alter table people add
  constraint fk_people_other_addr_country foreign key (other_addr_country) references countries;


create index idx_people_last_name on people (last_name);

create sequence seq_people_id;



------------------------
create table people_tags
(
  id numeric(9) not null,
  name character varying(100)
);

alter table people_tags add
  constraint pk_people_tags primary key (id);

create sequence seq_people_tags_id;




------------------------
create table people_people_tags
(
  people_id numeric(9),
  people_tags_id numeric(9)
);

alter table people_people_tags add
  constraint pk_people_people_tags primary key (people_id,people_tags_id);

alter table people_people_tags add
  constraint fk_p_p_tags_people_id foreign key (people_id) references people;
alter table people_people_tags add
  constraint fk_p_p_tags_people_tags_id foreign key (people_tags_id) references people_tags;




------------------------
CREATE TABLE users_login
(
  people_id numeric(9) NOT NULL,
  login_name character varying(30) not null,
  login_token character varying(100),
  login_token_expiration timestamp,
  login_password character varying(30) not null,
  language character varying(10),
  timezone_name character varying(40)
);

alter table users_login add
  constraint pk_users_login primary key (people_id);

create unique index idx_users_login_login_name on users_login (login_name);

alter table users_login add
  constraint fk_users_login_people foreign key (people_id) references people;





--------------------------
create table company_groups(
  id numeric(9) not null,
  name character varying(100));

alter table company_groups add
  constraint pk_company_groups primary key (id);

create sequence seq_company_groups_id;



--------------------------
create table company_categories(
  id numeric(9) not null,
  name character varying(100));

alter table company_categories add
  constraint pk_company_catgories primary key (id);

create sequence seq_company_categories_id;



--------------------------
create table company_subcategories(
  id numeric(9) not null,
  company_categories_id numeric(9),
  name character varying(100));

alter table company_subcategories add
  constraint pk_company_subcategories primary key (id);

alter table company_subcategories add
  constraint fk_company_subcategories_categ foreign key (company_categories_id) references company_categories;

create sequence seq_company_subcategories_id;



------------------------
create table contact_tags
(
  id numeric(9) not null,
  name character varying(100)
);

alter table contact_tags add
  constraint pk_contact_tags primary key (id);

create sequence seq_contact_tags_id;



------------------------
create table connection_tags
(
  id numeric(9) not null,
  name character varying(100)
);

alter table connection_tags add
  constraint pk_connection_tags primary key (id);

create sequence seq_connection_tags_id;



--------------------------
create table companies(
  id numeric(9) NOT NULL,
  reg_id character varying(20),
  vat_id character varying(20),
  company_name character varying(255) not null,
  company_group numeric(9),
  address_tag_1 Varchar(100),
  address_street_1 character varying(100),
  address_city_1 character varying(100),
  address_zip_1 character varying(20),
  address_region_1 character varying(100),
  phone_1_1 character varying(30),
  phone_1_1_tag Varchar(100),
  phone_1_2 character varying(30),
  phone_1_2_tag Varchar(100),
  phone_1_3 character varying(30),
  phone_1_3_tag Varchar(100),
  email_1_1 character varying(100),
  email_1_1_tag Varchar(100),
  email_1_2 character varying(100),
  email_1_2_tag Varchar(100),
  email_1_3 character varying(100),
  email_1_3_tag Varchar(100),
  fax_1_1 character varying(30),
  fax_1_1_tag Varchar(100),
  fax_1_2 character varying(30),
  fax_1_2_tag Varchar(100),
  address_tag_2 Varchar(100),
  address_street_2 character varying(100),
  address_city_2 character varying(100),
  address_zip_2 character varying(20),
  address_region_2 character varying(100),
  phone_2_1 character varying(30),
  phone_2_1_tag Varchar(100),
  phone_2_2 character varying(30),
  phone_2_2_tag Varchar(100),
  phone_2_3 character varying(30),
  phone_2_3_tag Varchar(100),
  email_2_1 character varying(100),
  email_2_1_tag Varchar(100),
  email_2_2 character varying(100),
  email_2_2_tag Varchar(100),
  email_2_3 character varying(100),
  email_2_3_tag Varchar(100),
  fax_2_1 character varying(30),
  fax_2_1_tag Varchar(100),
  fax_2_2 character varying(30),
  fax_2_2_tag Varchar(100),
  address_tag_3 Varchar(100),
  address_street_3 character varying(100),
  address_city_3 character varying(100),
  address_zip_3 character varying(20),
  address_region_3 character varying(100),
  phone_3_1 character varying(30),
  phone_3_1_tag Varchar(100),
  phone_3_2 character varying(30),
  phone_3_2_tag Varchar(100),
  phone_3_3 character varying(30),
  phone_3_3_tag Varchar(100),
  email_3_1 character varying(100),
  email_3_1_tag Varchar(100),
  email_3_2 character varying(100),
  email_3_2_tag Varchar(100),
  email_3_3 character varying(100),
  email_3_3_tag Varchar(100),
  fax_3_1 character varying(30),
  fax_3_1_tag Varchar(100),
  fax_3_2 character varying(30),
  fax_3_2_tag Varchar(100),
  website_1 character varying(100),
  website_2 character varying(100),
  website_3 character varying(100),
  facebook_1 character varying(100),
  google_1 character varying(100),
  twitter_1 character varying(100),
  category numeric(9),
  subcategory numeric(9),
  address_country_1 numeric(9),
  address_country_2 numeric(9),
  address_country_3 numeric(9),
  facebook_2 character varying(100),
  google_2 character varying(100),
  twitter_2 character varying(100),
  facebook_3 character varying(100),
  google_3 character varying(100),
  twitter_3 character varying(100),
  rating numeric(2)
);

alter table companies add
  constraint pk_companies primary key (id);

alter table companies add
  constraint fk_companies_groups foreign key (company_group) references company_groups;
alter table companies add
  constraint fk_companies_categories foreign key (category) references company_categories;
alter table companies add
  constraint fk_companies_subcategories foreign key (subcategory) references company_subcategories;
alter table companies add
  constraint fk_companies_address_1_tag foreign key (address_1_tag) references contact_tags;
alter table companies add
  constraint fk_companies_address_2_tag foreign key (address_2_tag) references contact_tags;
alter table companies add
  constraint fk_companies_address_3_tag foreign key (address_3_tag) references contact_tags;
alter table companies add
  constraint fk_companies_phone_1_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_1_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_1_3_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_2_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_2_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_2_3_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_3_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_3_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_phone_3_3_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_1_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_1_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_1_3_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_2_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_2_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_2_3_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_3_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_3_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_email_3_3_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_fax_1_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_fax_1_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_fax_2_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_fax_2_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_fax_3_1_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_companies_fax_3_2_tag foreign key (phone_1_1_tag) references connection_tags;
alter table companies add
  constraint fk_comp_address_country_1 foreign key (address_country_1) references countries;
alter table companies add
  constraint fk_comp_address_country_2 foreign key (address_country_2) references countries;
alter table companies add
  constraint fk_comp_address_country_3 foreign key (address_country_3) references countries;

alter table companies add
  constraint ck_comp_rating check (rating>=0 and rating<=10);


--create unique index idx_companies_company_name on companies (company_name);
create unique index idx_companies_reg_id on companies (reg_id);
create unique index idx_companies_vat_id on companies (vat_id);

create sequence seq_companies_id;




-----------------------
create table positions(
  id numeric(9),
  name character varying(100));

alter table positions add
  constraint pk_positions primary key (id);

create sequence seq_positions_id;




-----------------------
create table roles(
  id numeric(9),
  name character varying(100));

alter table roles add
  constraint pk_roles primary key (id);

create sequence seq_roles_id;




-----------------------
create table people_companies(
  people_id numeric(9) not null,
  companies_id numeric(9) not null,
  position_id numeric(9),
  role_id numeric(9),
  work_since date,
  work_to date);

alter table people_companies add
  constraint pk_people_companies primary key (people_id,companies_id);

alter table people_companies add
  constraint fk_people_companies_people foreign key (people_id) references people;
alter table people_companies add
  constraint fk_people_companies_companies foreign key (companies_id) references companies;
alter table people_companies add
  constraint fk_people_companies_positions foreign key (position_id) references positions;
alter table people_companies add
  constraint fk_people_companies_roles foreign key (role_id) references roles;




-----------------------
create table my_company(
  reg_id character varying(20),
  vat_id character varying(20),
  company_name character varying(100),
  company_addr_name character varying(100),
  company_addr_street character varying(100),
  company_addr_city character varying(100),
  company_addr_zip character varying(20),
  company_addr_region character varying(100),
  default_email character varying(100),
  orders_email character varying(100),
  phone character varying(30),
  fax character varying(30),
  billing_addr_name character varying(100),
  billing_addr_street character varying(100),
  billing_addr_city character varying(100),
  billing_addr_zip character varying(20),
  billing_addr_region character varying(100),
  billing_email character varying(100),
  billing_person character varying(100),
  logo bytea,
  company_addr_country numeric(9),
  billing_addr_country numeric(9));


alter table my_company add
  constraint fk_my_comp_addr_country foreign key (company_addr_country) references countries;
alter table my_company add
  constraint fk_my_bill_addr_country foreign key (billing_addr_country) references countries;





-----------------------
create table sales_pipeline_stages(
  id numeric(2),
  name character varying(40),
  custom_name character varying(40),
  custom_used numeric(1));

alter table sales_pipeline_stages add
  constraint pk_sales_pipeline_stages primary key (id);

alter table sales_pipeline_stages add
  constraint ck_sales_pipeline_stages_cust check (custom_used in (0,1));


insert into sales_pipeline_stages values (1,'Prospecting',null,1);
insert into sales_pipeline_stages values (2,'Preapproach',null,1);
insert into sales_pipeline_stages values (3,'Approach',null,1);
insert into sales_pipeline_stages values (4,'Need assessment',null,1);
insert into sales_pipeline_stages values (5,'Presentation',null,1);
insert into sales_pipeline_stages values (6,'Meeting objections',null,1);
insert into sales_pipeline_stages values (7,'Gaining commitment',null,1);
insert into sales_pipeline_stages values (8,'Follow-up',null,1);




-----------------------
create table products(
  id numeric(9) not null,
  code character varying(40),
  name character varying(100),
  short_description character varying(255),
  full_description bytea,
  rrp numeric(21,6),
  price_1 numeric(21,6),
  price_2 numeric(21,6),
  price_3 numeric(21,6),
  price_4 numeric(21,6),
  price_5 numeric(21,6),
  picture bytea);

alter table products add
  constraint pk_products primary key (id);

create sequence seq_product_id;




-----------------------
create table sales_pipeline(
  id numeric(9) not null,
  company_id numeric(9),
  subject character varying(100),
  owner_id numeric(9),
  description character varying(255),
  stage_id numeric(2));

alter table sales_pipeline add
  constraint pk_sales_pipeline primary key (id);

alter table sales_pipeline add
  constraint fk_sales_pipeline_company_id foreign key (company_id) references companies;
alter table sales_pipeline add
  constraint fk_sales_pipeline_owner_id foreign key (owner_id) references people;
alter table sales_pipeline add
  constraint fk_sales_pipeline_stage_id foreign key (stage_id) references sales_pipeline_stages;

create sequence seq_sales_pipeline_id;




-----------------------
create table sales_pipeline_products(
  sales_pipeline_id numeric(9) not null,
  number numeric(9) not null,
  products_id numeric(9),
  price numeric(21,6),
  amount numeric(14,4));

alter table sales_pipeline_products add
  constraint pk_sales_pipeline_products primary key (sales_pipeline_id,number);

alter table sales_pipeline_products add
  constraint fk_sp_prod_sales_pipeline foreign key (sales_pipeline_id) references sales_pipeline;
alter table sales_pipeline_products add
  constraint fk_sp_prod_products foreign key (products_id) references products;




-----------------------
--drop table appointment_types cascade;
create table appointment_types(
  id numeric(2) not null,
  name character varying(40));

alter table appointment_types add
  constraint pk_appointment_types primary key (id);





-----------------------
--drop table appointment_tags cascade;
create table appointment_tags(
  id numeric(9) not null,
  name character varying(40));

alter table appointment_tags add
  constraint pk_appointment_tags primary key (id);

create sequence seq_appointment_tags_id;





-----------------------
create table appointment_places(
  id numeric(9),
  name character varying(40));

alter table appointment_places add
  constraint pk_appointment_places primary key (id);

delete from appointment_places;
insert into appointment_places values (1,'AT_OFFICE');
insert into appointment_places values (2,'HOME');
insert into appointment_places values (3,'ELSEWHERE');

commit;



-----------------------
--drop table appointments cascade;
create table appointments(
  id numeric(9) not null,
  subject character varying(100),
  place character varying(100),
  location character varying(100),
  company_id numeric(9),
  reminder numeric(1),
  team_reminder numeric(1),
  attendee_reminder numeric(1),
  memo character varying(2000),
  sales_pipeline_id numeric(9),
  sales_pipeline_stage_id numeric(2),
  type_id numeric(2),
  private numeric(1),
  owner_id numeric(9),
  timezone_name character varying(40),
  reminder_seconds numeric(9,0),
  team_reminder_seconds numeric(9,0),
  attendee_reminder_seconds numeric(9,0),
  start_time timestamp without time zone,
  end_time timestamp without time zone
);

alter table appointments add
  constraint pk_appointments primary key (id);

alter table appointments add
  constraint fk_appointments_company_id foreign key (company_id) references companies;
alter table appointments add
  constraint fk_appointments_sales_pipe_id foreign key (sales_pipeline_id) references sales_pipeline;
alter table appointments add
  constraint fk_appointments_sales_p_st_id foreign key (sales_pipeline_stage_id) references sales_pipeline_stages;
alter table appointments add
  constraint fk_appointments_type_id foreign key (type_id) references appointment_types;
alter table appointments add
  constraint fk_appointments_app_tag_id foreign key (appointment_tag_id) references appointment_tags;
alter table appointments add
  constraint fk_appointments_owner_id foreign key (owner_id) references people;

alter table appointments add
  constraint ck_appointments_private check (private in (0,1));
alter table appointments add
  constraint ck_appointments_reminder check (reminder in (0,1));
alter table appointments add
  constraint ck_appointments_team_reminder check (team_reminder in (0,1));
alter table appointments add
  constraint ck_appointments_atten_reminder check (attendee_reminder in (0,1));
alter table appointments add
  constraint ck_appointments_time_zone check (time_zone>=0 and time_zone<24);

create sequence seq_appointments_id;




-----------------------
--drop table appointment_persons cascade;
create table appointment_persons(
  appointment_id numeric(9) not null,
  person_id numeric(9) not null);

alter table appointment_persons add
  constraint pk_appointment_persons primary key (appointment_id,person_id);

alter table appointment_persons add
  constraint fk_appointment_persons_cal_id foreign key (appointment_id) references appointments;
alter table appointment_persons add
  constraint fk_appointment_persons_person_id foreign key (person_id) references people;




-----------------------
--drop table appointment_appointment_tags cascade;
create table appointment_appointment_tags(
  appointment_id numeric(9) not null,
  appointment_tag_id numeric(9) not null);

alter table appointment_appointment_tags add
  constraint pk_app_app_tags primary key (appointment_id,appointment_tag_id);

alter table appointment_appointment_tags add
  constraint fk_app_app_tags_app_id foreign key (appointment_id) references appointments;
alter table appointment_appointment_tags add
  constraint fk_app_app_tags_app_tag_id foreign key (appointment_tag_id) references appointment_tags;





-----------------------
create table projects(
  id numeric(9) not null,
  subject character varying(100),
  description character varying(255),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  owner_id numeric(9),
  company_id numeric(9),
  person_id numeric(9));

alter table projects add
  constraint pk_projects primary key (id);

alter table projects add
  constraint fk_projects_owner_id foreign key (owner_id) references people;

alter table projects add
  constraint fk_projects_company_id foreign key (company_id) references companies;

alter table projects add
  constraint fk_projects_person_id foreign key (person_id) references people;

create sequence seq_projects_id;



-----------------------
create table tasks(
  id numeric(9) not null,
  project_id numeric(9),
  subject character varying(100),
  description character varying(255),
  start_date timestamp with time zone,
  due_date timestamp with time zone,
  priority numeric(1),
  company_id numeric(9),
  person_id numeric(9),
  preceding_task_id numeric(9),
  following_task_id numeric(9));

alter table tasks add
  constraint pk_tasks primary key (id);

alter table tasks add
  constraint fk_tasks_project_id foreign key (project_id) references projects;
alter table tasks add
  constraint fk_tasks_company_id foreign key (company_id) references companies;
alter table tasks add
  constraint fk_tasks_person_id foreign key (person_id) references people;
alter table tasks add
  constraint fk_tasks_preceding_task_id foreign key (preceding_task_id) references tasks;
alter table tasks add
  constraint fk_tasks_following_task_id foreign key (following_task_id) references tasks;
alter table tasks add
  constraint ck_tasks_priority check (priority in (0,1,2));

create sequence seq_tasks_id;




-----------------------
--create table
-----------------------
--drop table reminder;
create table reminder(
  id numeric(9) not null,
  recipient_id numeric(9),
  subject character varying(100),
  note character varying (2000),
  original_time timestamp,
  reminder_time timestamp,
  in_app_rem numeric(1),
  email_rem numeric(1),
  appointment_id numeric(9),
  task_id numeric(9),
  goal_id numeric(9));

alter table reminder add
  constraint pk_reminder primary key (id);

alter table reminder add
  constraint fk_reminder_recipient_id foreign key (recipient_id) references people;
alter table reminder add
  constraint fk_reminder_appointment_id foreign key (appointment_id) references appointments;
alter table reminder add
  constraint fk_reminder_task_id foreign key (task_id) references tasks;
alter table reminder add
  constraint fk_reminder_goal_id foreign key (goal_id) references goals;
alter table reminder add
  constraint ck_reminder_in_app_rem check (in_app_rem in (0,1));
alter table reminder add
  constraint ck_reminder_email_rem check (email_rem in (0,1));

create sequence seq_reminder_id;





-----------------------
--drop table timezones;
create table timezones (
    id numeric(9) not null,
    country numeric(9) not null,
    name character varying(40) not null);

alter table timezones add
  constraint pk_timezones primary key (id);

alter table timezones add
  constraint fk_timezones_country foreign key (country) references countries;

alter table timezones add
  constraint uq_timezones_name unique (name);




-----------------------
--drop table timezones_validity;
create table timezones_validity (
    zone_id numeric(9) not null,
    abbreviation character varying(6) not null,
    start_time numeric not null,
    gmt_offset numeric not null,
    dst numeric(1) not null);

alter table timezones_validity add
  constraint pk_timezones_validity primary key (zone_id,start_time);

alter table timezones_validity add
  constraint fk_timezones_validity_zone_id foreign key (zone_id) references timezones;






-----------------------
select
  abbreviation,
  date '1.1.1970' + start_time * interval '1 second' as start_time,
  gmt_offset/3600 as gmt_offset,
  dst
from
  timezones_validity
where
  zone_id=131;
-----------------------





-----------------------
--IMPORT
-----------------------
--drop table imp_companies;
create table imp_companies(
  id numeric(9) NOT NULL,
  ext_id character varying(100),
  reg_id character varying(20),
  vat_id character varying(20),
  company_name character varying(255),
  company_group character varying(100),
  address_tag_1 character varying(100),
  address_street_1 character varying(100),
  address_city_1 character varying(100),
  address_zip_1 character varying(20),
  address_region_1 character varying(100),
  address_country_1 character varying(3),
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
  fax_1_2 character varying(100),
  fax_1_2_tag character varying(100),
  address_tag_2 character varying(100),
  address_street_2 character varying(100),
  address_city_2 character varying(100),
  address_zip_2 character varying(20),
  address_region_2 character varying(100),
  address_country_2 character varying(3),
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
  address_country_3 character varying(3),
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
  facebook_2 character varying(100),
  facebook_3 character varying(100),
  google_1 character varying(100),
  google_2 character varying(100),
  google_3 character varying(100),
  twitter_1 character varying(100),
  twitter_2 character varying(100),
  twitter_3 character varying(100),
  category character varying(100),
  subcategory character varying(100)
);

alter table imp_companies add
  constraint pk_imp_companies primary key (id);

create sequence seq_imp_companies_id;

create table logging(
id Serial,
date_event timestamp with time zone,
content Text
);

alter table logging add primary key (id);
alter table logging add user_db varchar(30);
alter table logging add user_login varchar(100);


CREATE FUNCTION to_ascii(bytea, name)
RETURNS text AS 'to_ascii_encname' LANGUAGE internal IMMUTABLE STRICT;

alter table users_login alter column login_password TYPE character varying(100);
insert into appointment_types(id, name) values(1,'PHONE_CALL');
insert into appointment_types(id, name) values(2,'ALL_DAY_EVENT');
insert into appointment_types(id, name) values(3,'BUSINESS_MEETING');
insert into appointment_types(id, name) values(4,'OTHER_APPOINTMENT');


-----------------------
-- od verze 9
grant select,insert,update,delete on all tables in schema public to notia_user;
grant usage on all sequences in schema public to notia_user;
-- jinak
grant select,insert,update,delete on countries to notia_user;
grant select,insert,update,delete on people to notia_user;
grant select,insert,update,delete on people_people_tags to notia_user;
grant select,insert,update,delete on people_tags to notia_user;
grant select,insert,update,delete on users_login to notia_user;
grant select,insert,update,delete on company_groups to notia_user;
grant select,insert,update,delete on company_categories to notia_user;
grant select,insert,update,delete on company_subcategories to notia_user;
grant select,insert,update,delete on contact_tags to notia_user;
grant select,insert,update,delete on connection_tags to notia_user;
grant select,insert,update,delete on companies to notia_user;
grant select,insert,update,delete on positions to notia_user;
grant select,insert,update,delete on roles to notia_user;
grant select,insert,update,delete on people_companies to notia_user;
grant select,insert,update,delete on my_company to notia_user;
grant select,insert,update,delete on products to notia_user;
grant select,insert,update,delete on sales_pipeline_stages to notia_user;
grant select,insert,update,delete on sales_pipeline to notia_user;
grant select,insert,update,delete on sales_pipeline_products to notia_user;
grant select,insert,update,delete on appointment_types to notia_user;
grant select,insert,update,delete on appointment_tags to notia_user;
grant select,insert,update,delete on appointment_places to notia_user;
grant select,insert,update,delete on appointments to notia_user;
grant select,insert,update,delete on appointment_persons to notia_user;
grant select,insert,update,delete on projects to notia_user;
grant select,insert,update,delete on tasks to notia_user;
grant select,insert,update,delete on reminder to notia_user;
grant select,insert,update,delete on appointment_appointment_tags to notia_user;
grant select,insert,update,delete on imp_companies to notia_user;

grant usage on seq_countries_id to notia_user;
grant usage on seq_people_id to notia_user;
grant usage on seq_people_tags_id to notia_user;
grant usage on seq_company_groups_id to notia_user;
grant usage on seq_company_categories_id to notia_user;
grant usage on seq_company_subcategories_id to notia_user;
grant usage on seq_contact_tags_id to notia_user;
grant usage on seq_connection_tags_id to notia_user;
grant usage on seq_companies_id to notia_user;
grant usage on seq_positions_id to notia_user;
grant usage on seq_roles_id to notia_user;
grant usage on seq_product_id to notia_user;
grant usage on seq_sales_pipeline_id to notia_user;
grant usage on seq_appointment_tags_id to notia_user;
grant usage on seq_appointments_id to notia_user;
grant usage on seq_projects_id to notia_user;
grant usage on seq_tasks_id to notia_user;
grant usage on seq_reminder_id to notia_user;
grant usage on seq_imp_companies_id to notia_user;
grant select on timezones to notia_user;
grant select on timezones_validity to notia_user;


