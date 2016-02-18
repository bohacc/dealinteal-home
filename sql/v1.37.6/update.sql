alter table sales add unit_cost numeric(17,2);
alter table sales add total_cost numeric(17,2);
alter table sales add total_common_cost numeric(17,2);
alter table sales add total_common_profit numeric(17,2);

--------------------------------------------------------
alter table users_login add exch_user character varying(240);
alter table users_login add exch_password character varying(240);
alter table users_login add exch_server character varying(240);
alter table users_login add exch_contacts numeric(1) default 0;
alter table users_login add exch_contacts_last_key character varying(4000);
alter table users_login add exch_contacts_last_date date;
alter table users_login add exch_appointments numeric(1) default 0;
alter table users_login add exch_appointments_last_key character varying(4000);
alter table users_login add exch_appointments_last_date date;
alter table users_login add exch_appointments_valid_days numeric(3) default 14;
alter table users_login add exch_tasks numeric(1) default 0;
alter table users_login add exch_tasks_last_key character varying(4000);
alter table users_login add exch_tasks_last_date date;
alter table users_login add exch_tasks_valid_days numeric(3) default 14;



--------------------------------------------------------
create table parameters(
  id numeric(9) not null,
  code character varying(100) not null,
  value character varying(4000));

alter table parameters add
  constraint pk_parameter primary key (id);

create unique index idx_parameters_code on parameters (code);

create sequence seq_parameters_id;


insert into parameters values(nextval('seq_parameters_id'),'EXCHANGE_WALLET',null);
insert into parameters values(nextval('seq_parameters_id'),'EXCHANGE_WALLET_PASSWORD',null);



--------------------------------------------------------
create table people_companies_synch(
  id numeric(9) not null,
  companies_id numeric(9),
  people_id numeric(9),
  position_id numeric(9),
  user_id numeric(9) not null,
  data_in numeric(1) not null default 0,
  status numeric(1) not null default 0,
  exch_id character varying(4000),
  exch_key character varying(4000),
  external_system character varying(100) not null);

alter table people_companies_synch add
  constraint pk_people_companies_synch primary key (id);

alter table people_companies_synch add
  constraint fk_people_comp_synch_comp_id foreign key (companies_id) references companies;

alter table people_companies_synch add
  constraint fk_people_comp_synch_people_id foreign key (people_id) references people;

alter table people_companies_synch add
  constraint fk_people_comp_synch_pos_id foreign key (position_id) references positions;

alter table people_companies_synch add
  constraint fk_people_comp_synch_user_id foreign key (user_id) references users_login;


create sequence seq_people_companies_synch_id;



--------------------------------------------------------
create table appointments_synch(
  id numeric(9) not null,
  appointment_id numeric(9) not null,
  person_id numeric(9),
  user_id numeric(9) not null,
  data_in numeric(1) not null default 0,
  status numeric(1) not null default 0,
  exch_id character varying(4000),
  exch_key character varying(4000),
  external_system character varying(100) not null);

alter table appointments_synch add
  constraint pk_appointments_synch primary key (id);

alter table appointments_synch add
  constraint fk_appointments_synch_app_id foreign key (appointment_id) references appointments;

alter table appointments_synch add
  constraint fk_appointments_people_id foreign key (person_id) references people;

alter table appointments_synch add
  constraint fk_appointments_synch_user_id foreign key (user_id) references users_login;


create sequence seq_appointments_synch_id;




--------------------------------------------------------
create table tasks_synch(
  id numeric(9) not null,
  task_id numeric(9) not null,
  person_id numeric(9),
  user_id numeric(9) not null,
  data_in numeric(1) not null default 0,
  status numeric(1) not null default 0,
  exch_id character varying(4000),
  exch_key character varying(4000),
  external_system character varying(100) not null);

alter table tasks_synch add
  constraint pk_tasks_synch primary key (id);

alter table tasks_synch add
  constraint fk_tasks_synch_app_id foreign key (task_id) references tasks;

alter table tasks_synch add
  constraint fk_tasks_synch_people_id foreign key (person_id) references people;

alter table tasks_synch add
  constraint fk_tasks_synch_user_id foreign key (user_id) references users_login;


create sequence seq_tasks_synch_id;




-------------------------------------------------------
create table task_people (
  task_id numeric(9) not null,
  people_id numeric(9) not null,
  start_date timestamp without time zone,
  due_date timestamp without time zone);

alter table task_people add
  constraint pk_task_people primary key (task_id,person_id);

alter table task_people add
  constraint fk_task_people_task_id foreign key (task_id) references tasks;

alter table task_people add
  constraint fk_task_people_people_id foreign key (people_id) references people;



insert into task_people select id,assigned_to_id,start_date,due_date from tasks;

alter table tasks drop column assigned_to_id;


grant select,insert,update,delete on parameters TO notia_user;
grant select,insert,update,delete on people_companies_synch TO notia_user;
grant select,insert,update,delete on appointments_synch TO notia_user;
grant select,insert,update,delete on tasks_synch TO notia_user;
grant select,insert,update,delete on task_people TO notia_user;

grant usage on seq_parameters_id to notia_user;
grant usage on seq_people_companies_synch_id to notia_user;
grant usage on seq_appointments_synch_id to notia_user;
grant usage on seq_tasks_synch_id to notia_user;
alter table sales_pipeline_stages add chance numeric(3);
alter table sales_pipeline_stages add
  constraint ck_sales_pipeline_stages_chan check (chance is null or (chance>=0 and chance<=100));

create sequence seq_sales_pipeline_stages_id start with 10;

grant usage on seq_sales_pipeline_stages_id to notia_user;
