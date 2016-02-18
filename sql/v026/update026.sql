-----------------------
--drop table sales_pipeline_tags cascade;
create table sales_pipeline_tags(
  id numeric(9) not null,
  name character varying(40));

alter table sales_pipeline_tags add
  constraint pk_sales_pipeline_tags primary key (id);

create sequence seq_sales_pipeline_tags_id;




-----------------------
--drop table sales_pipeline_salpipe_tags cascade;
create table sales_pipeline_salpipe_tags(
  sales_pipeline_id numeric(9) not null,
  sales_pipeline_tag_id numeric(9) not null);

alter table sales_pipeline_salpipe_tags add
  constraint pk_sales_pipeline_salpipe_tags primary key (sales_pipeline_id,sales_pipeline_tag_id);

alter table sales_pipeline_salpipe_tags add
  constraint fk_salpipe_salpipe_tags_sp_id foreign key (sales_pipeline_id) references sales_pipeline;
alter table sales_pipeline_salpipe_tags add
  constraint fk_salpipe_salpipe_tags_tag_id foreign key (sales_pipeline_tag_id) references sales_pipeline_tags;

grant select,insert,update,delete on sales_pipeline_tags to notia_user;
grant select,insert,update,delete on sales_pipeline_salpipe_tags to notia_user;
grant usage on seq_sales_pipeline_tags_id to notia_user;

alter table logging add table_name varchar(30);
alter table logging add method varchar(30);
alter table logging add pk varchar(30);