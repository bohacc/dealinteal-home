GRANT ALL ON TABLE companies_import_csv_v1 TO notia_admin;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE companies_import_csv_v1 TO notia_user;

ALTER TABLE companies_import_csv_v1 ALTER COLUMN people_id DROP NOT NULL;
ALTER TABLE companies_import_csv_v1 ALTER COLUMN people_last_name DROP NOT NULL;