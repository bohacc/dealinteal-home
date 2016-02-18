Alter table tasks add reminder_seconds numeric(9,0);
Alter table tasks drop column reminder_id;
ALTER TABLE reminder ADD COLUMN email character varying(100);
