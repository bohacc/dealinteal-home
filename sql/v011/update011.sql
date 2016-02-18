Alter table sales add
  domain_id numeric(9);

alter table sales add
  constraint fk_sales_domain_id foreign key (domain_id) references domains;
