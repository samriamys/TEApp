-- Application-owned profile data; Keycloak owns credentials and identity.
CREATE TABLE IF NOT EXISTS app_profile (
    subject VARCHAR(255) PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'tutor')),
    tutor_code VARCHAR(32) UNIQUE,
    tutor_subject VARCHAR(255) REFERENCES app_profile(subject),
    CHECK ((role = 'tutor' AND tutor_code IS NOT NULL AND tutor_subject IS NULL)
        OR (role = 'student' AND tutor_code IS NULL AND tutor_subject IS NOT NULL))
);

ALTER TABLE app_profile ADD COLUMN IF NOT EXISTS display_name VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE app_profile ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '';
