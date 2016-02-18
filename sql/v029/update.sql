alter table products add currency_rrp character varying(3);
alter table products add currency_1 character varying(3);
alter table products add currency_2 character varying(3);
alter table products add currency_3 character varying(3);
alter table products add currency_4 character varying(3);
alter table products add currency_5 character varying(3);

alter table products add constraint fk_products_currency_rrp foreign key (currency_rrp) references currency;
alter table products add constraint fk_products_currency_1 foreign key (currency_1) references currency;
alter table products add constraint fk_products_currency_2 foreign key (currency_2) references currency;
alter table products add constraint fk_products_currency_3 foreign key (currency_3) references currency;
alter table products add constraint fk_products_currency_4 foreign key (currency_4) references currency;
alter table products add constraint fk_products_currency_5 foreign key (currency_5) references currency;
