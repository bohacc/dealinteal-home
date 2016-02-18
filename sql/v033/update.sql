create table units(
  code character varying(10),
  name character varying(100));

alter table units add constraint pk_units primary key (code);

insert into units select distinct unit, null from products where unit is not null;
alter table products add constraint fk_products_units foreign key (unit) references units;

ALTER TABLE units OWNER TO notia_admin;
GRANT ALL ON TABLE units TO notia_admin;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE units TO notia_user;


create table appointment_projects(
  appointment_id numeric(9),
  project_id numeric(9));

alter table appointment_projects add constraint pk_appointment_projects primary key (appointment_id, project_id);
alter table appointment_projects add constraint fk_appointment_projects_app_id foreign key (appointment_id) references appointments;
alter table appointment_projects add constraint fk_appointment_projects_project_id foreign key (project_id) references projects;

ALTER TABLE appointment_projects OWNER TO notia_admin;
GRANT ALL ON TABLE appointment_projects TO notia_admin;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE appointment_projects TO notia_user;
