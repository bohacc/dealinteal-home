CREATE DATABASE dit_logging
  WITH OWNER = notia_admin
       ENCODING = 'UTF8'
       TABLESPACE = notia
       LC_COLLATE = 'en_US.UTF-8'
       LC_CTYPE = 'en_US.UTF-8'
       CONNECTION LIMIT = -1;

CREATE ROLE notia_user_logging LOGIN ENCRYPTED PASSWORD 'md52d79bbc74eac1dba32cc4196745fc574'
   VALID UNTIL 'infinity';
grant select on connections to notia_user_logging;
ALTER USER notia_user_logging WITH PASSWORD 'notia';
GRANT CONNECT ON DATABASE dit_logging TO notia_user_logging;
GRANT CONNECT ON DATABASE dit_develop TO notia_user;


create table logging
(
  id Serial,
  date_event timestamp with time zone,
  content Text,
  user_db varchar(30),
  user_login varchar(100)
);


alter table logging add primary key (id);


--insert into users_login(people_id, login_name, login_token, login_password, timezone_id) values(22, 'testovaci', 'TESTOVACITOKEN', 'testovaci', 131);



create table connections(
  id Serial,
  connect_string varchar(100),
  database_user varchar(100),
  database_name varchar(100),
  database_host varchar(100),
  database_port varchar(100),
  description Text
);

alter table connections add constraint pk_connections primary key (id);
create unique index idx_connections_connect_string on connections (connect_string);

