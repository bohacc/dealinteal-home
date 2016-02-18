-----------------------
create table currency
(
  code character varying(3) not null,
  name character varying(100)
);

alter table currency add
  constraint pk_currency primary key (code);




-----------------------
create table sales
(
  id numeric(9),
  doc_date date,
  company_id numeric(9),
  document character varying(20),
  rep_id numeric(9),
  product_id numeric(9),
  note character varying(2000),
  quantity numeric(14,4),
  unit_price numeric(21,6),
  discount numeric(9,3),
  total_price numeric(17,2),
  currency character varying(3),
  rate numeric(9,6),
  total_common_price numeric(17,2)
);

alter table sales add
  constraint pk_sales primary key (id);

alter table sales add
  constraint fk_sales_company_id foreign key (company_id) references companies;
alter table sales add
  constraint fk_sales_product_id foreign key (product_id) references products;
alter table sales add
  constraint fk_sales_rep_id foreign key (rep_id) references people;
alter table sales add
  constraint fk_sales_currency foreign key (currency) references currency;

create sequence seq_sales_id;





-----------------------
create table domains
(
  id numeric(9),
  name character varying(100)
);

alter table domains add
  constraint pk_domains primary key (id);

create sequence seq_domains_id;





-----------------------
create table sales_plan_company
(
  year numeric(4),
  month numeric(2),
  revenue_plan numeric(17,2),
  amount_plan numeric(14,4)
);

create index idx_sales_plan_comp_ym on sales_plan_company (year,month);

alter table sales_plan_company add
  constraint ck_sales_plan_comp_month check (month>=1 and month<=12 or month is null);
alter table sales_plan_company add
  constraint ck_sales_plan_comp_year check (year>=2000);





-----------------------
create table sales_plan_domain
(
  domain_id numeric(9),
  year numeric(4),
  month numeric(2),
  revenue_plan numeric(17,2),
  amount_plan numeric(14,4)
);

create index idx_sales_plan_domain_ym on sales_plan_domain (year,month);

alter table sales_plan_domain add
  constraint fk_sales_plan_domain_domain_id foreign key (domain_id) references domains;
alter table sales_plan_domain add
  constraint ck_sales_plan_domain_month check (month>=1 and month<=12 or month is null);
alter table sales_plan_domain add
  constraint ck_sales_plan_domain_year check (year>=2000);





-----------------------
create table sales_plan_personal
(
  domain_id numeric(9),
  rep_id numeric(9),
  year numeric(4),
  month numeric(2),
  revenue_plan numeric(17,2),
  amount_plan numeric(14,4)
);

create index idx_sales_plan_personal_ym on sales_plan_personal (year,month);

alter table sales_plan_personal add
  constraint fk_sales_plan_pers_domain_id foreign key (domain_id) references domains;
alter table sales_plan_personal add
  constraint fk_sales_plan_pers_rep_id foreign key (rep_id) references people;
alter table sales_plan_personal add
  constraint ck_sales_plan_pers_month check (month>=1 and month<=12 or month is null);
alter table sales_plan_personal add
  constraint ck_sales_plan_pers_year check (year>=2000);





-----------------------
create table sales_plan_product
(
  product_id numeric(9),
  year numeric(4),
  month numeric(2),
  revenue_plan numeric(17,2),
  amount_plan numeric(14,4)
);

create index idx_sales_plan_product_ym on sales_plan_product (year,month);

alter table sales_plan_product add
  constraint fk_sales_plan_prod_product_id foreign key (product_id) references products;
alter table sales_plan_product add
  constraint ck_sales_plan_prod_month check (month>=1 and month<=12 or month is null);
alter table sales_plan_product add
  constraint ck_sales_plan_prod_year check (year>=2000);



grant select,insert,update,delete on currency to notia_user;
grant select,insert,update,delete on sales to notia_user;
grant select,insert,update,delete on domains to notia_user;
grant select,insert,update,delete on sales_plan_company to notia_user;
grant select,insert,update,delete on sales_plan_domain to notia_user;
grant select,insert,update,delete on sales_plan_personal to notia_user;
grant select,insert,update,delete on sales_plan_product to notia_user;

grant usage on seq_sales_id to notia_user;
grant usage on seq_domains_id to notia_user;

grant select,insert,update,delete on currency to dit_u001;
grant select,insert,update,delete on sales to dit_u001;
grant select,insert,update,delete on domains to dit_u001;
grant select,insert,update,delete on sales_plan_company to dit_u001;
grant select,insert,update,delete on sales_plan_domain to dit_u001;
grant select,insert,update,delete on sales_plan_personal to dit_u001;
grant select,insert,update,delete on sales_plan_product to dit_u001;

grant usage on seq_sales_id to dit_u001;
grant usage on seq_domains_id to dit_u001;
