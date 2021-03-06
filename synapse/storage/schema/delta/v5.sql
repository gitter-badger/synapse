
CREATE TABLE IF NOT EXISTS user_ips (
    user TEXT NOT NULL,
    access_token TEXT NOT NULL,
    device_id TEXT,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    last_seen INTEGER NOT NULL,
    CONSTRAINT user_ip UNIQUE (user, access_token, ip, user_agent) ON CONFLICT REPLACE
);

CREATE INDEX IF NOT EXISTS user_ips_user ON user_ips(user);

ALTER TABLE users ADD COLUMN admin BOOL DEFAULT 0 NOT NULL;

PRAGMA user_version = 5;
