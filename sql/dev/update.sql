insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 0, 'I', NULL
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 0 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 0, 'U', NULL
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 0 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 0, 'S', NULL
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 0 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 0, 'D', NULL
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 0 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 0, 'I', NULL
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 0 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 0, 'U', NULL
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 0 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 0, 'S', NULL
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 0 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 0, 'D', NULL
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 0 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 0, 'I', NULL
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 0 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 0, 'U', NULL
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 0 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 0, 'S', NULL
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 0 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 0, 'D', NULL
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 0 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 0, 'I', NULL
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 0 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 0, 'U', NULL
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 0 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 0, 'S', NULL
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 0 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 0, 'D', NULL
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 0 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 0, 'I', NULL
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 0 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 0, 'U', NULL
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 0 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 0, 'S', NULL
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 0 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 0, 'D', NULL
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 0 AND operation = 'D');

-- RES TYPE 1 --
----------------
insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 1, 'I', 'appointments'
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 1 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 1, 'U', ' AND EXISTS(select 1 from (select * from appointments where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 1 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 1, 'S', 'select * from appointments where owner_id = :owner_id'
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 1 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'APPOINTMENTS', 1, 'D', ' AND EXISTS(select 1 from (select * from appointments where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'APPOINTMENTS' AND res_type = 1 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 1, 'I', 'companies'
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 1 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 1, 'U', ' AND EXISTS(select 1 from (select * from companies where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 1 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 1, 'S', 'select * from companies where owner_id = :owner_id'
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 1 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'COMPANIES', 1, 'D', ' AND EXISTS(select 1 from (select * from companies where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'COMPANIES' AND res_type = 1 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 1, 'I', 'reminder'
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 1 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 1, 'U', ' AND EXISTS(select 1 from (select * from reminder where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 1 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 1, 'S', 'select * from reminder where owner_id = :owner_id'
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 1 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'REMINDER', 1, 'D', ' AND EXISTS(select 1 from (select * from reminder where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'REMINDER' AND res_type = 1 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 1, 'I', 'sales_pipeline'
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 1 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 1, 'U', ' AND EXISTS(select 1 from (select * from sales_pipeline where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 1 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 1, 'S', 'select * from sales_pipeline where owner_id = :owner_id'
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 1 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'SALES_PIPELINE', 1, 'D', ' AND EXISTS(select 1 from (select * from sales_pipeline where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'SALES_PIPELINE' AND res_type = 1 AND operation = 'D');

insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 1, 'I', 'tasks'
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 1 AND operation = 'I');
insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 1, 'U', ' AND EXISTS(select 1 from (select * from tasks where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 1 AND operation = 'U');
insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 1, 'S', 'select * from tasks where owner_id = :owner_id'
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 1 AND operation = 'S');
insert into restrictions select nextval('seq_restrictions_id'), 'TASKS', 1, 'D', ' AND EXISTS(select 1 from (select * from tasks where owner_id = :owner_id) x where id = :id)'
  where not exists(select 1 from restrictions r where object = 'TASKS' AND res_type = 1 AND operation = 'D');

