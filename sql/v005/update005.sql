drop table tasks cascade;
create table tasks(
  id numeric(9) not null,
  project_id numeric(9),
  subject character varying(100),
  description character varying(255),
  start_date timestamp without time zone,
  due_date timestamp without time zone,
  reminder_id numeric(9),
  timezone_name character varying(40),
  finish_date timestamp without time zone,
  priority numeric(1),
  owner_id numeric(9),
  assigned_to_id numeric(9),
  private numeric(1),
  company_id numeric(9),
  person_id numeric(9),
  sales_pipeline_id numeric(9),
  sales_pipeline_stage_id numeric(9),
  preceding_task_id numeric(9));

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
  constraint fk_tasks_reminder_id foreign key (reminder_id) references reminder;
alter table tasks add
  constraint fk_tasks_owner_id foreign key (owner_id) references people;
alter table tasks add
  constraint fk_tasks_assigned_to_id foreign key (assigned_to_id) references people;
alter table tasks add
  constraint fk_tasks_sales_pipeline_id foreign key (sales_pipeline_id) references sales_pipeline;
alter table tasks add
  constraint fk_tasks_sales_pipeline_st_id foreign key (sales_pipeline_stage_id) references sales_pipeline_stages;

alter table tasks add
  constraint ck_tasks_priority check (priority in (0,1,2));
alter table tasks add
  constraint ck_tasks_private check (private in (0,1));

alter table reminder add
  constraint fk_reminder_task_id foreign key (task_id) references tasks;

create sequence seq_tasks_id;



-------------------------
create table tasks_tags
(
  id numeric(9) not null,
  name character varying(100)
);

alter table tasks_tags add
  constraint pk_tasks_tags primary key (id);

create sequence seq_tasks_tags_id;




------------------------
create table tasks_tasks_tags
(
  tasks_id numeric(9),
  tasks_tags_id numeric(9)
);

alter table tasks_tasks_tags add
  constraint pk_tasks_tasks_tags primary key (tasks_id,tasks_tags_id);

alter table tasks_tasks_tags add
  constraint fk_t_t_tags_tasks_id foreign key (tasks_id) references tasks;
alter table tasks_tasks_tags add
  constraint fk_t_t_tags_tasks_tags_id foreign key (tasks_tags_id) references tasks_tags;


-----
grant select,insert,update,delete on tasks to notia_user;
grant select,insert,update,delete on tasks_tasks_tags to notia_user;
grant select,insert,update,delete on tasks_tags to notia_user;

grant usage on seq_tasks_id to notia_user;
grant usage on seq_tasks_tags_id to notia_user;

Alter table reminder add finish_date timestamp without time zone;


grant select,insert,update,delete on tasks to dit_u001;
grant select,insert,update,delete on tasks_tasks_tags to dit_u001;
grant select,insert,update,delete on tasks_tags to dit_u001;

grant usage on seq_tasks_id to dit_u001;
grant usage on seq_tasks_tags_id to dit_u001;

grant select,insert,update,delete on reminder to dit_u001;

