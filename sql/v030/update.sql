alter table reminder add owner_id numeric(9);
alter table reminder add
  constraint fk_reminder_owner_id foreign key (owner_id) references people;