alter table sales_pipeline add chance numeric(3);
alter table sales_pipeline add
  constraint ck_sales_pipeline_chance check (chance>=0 and chance<=100);
alter table sales_pipeline add
  person_id numeric(9);

alter table sales_pipeline add
  constraint fk_sales_pipeline_person_id foreign key (person_id) references people;
