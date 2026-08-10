-- V2: Fix password hashes cho seed users
-- admin password: admin123
-- nv001 password: nv001pass

UPDATE users SET password_hash = '$2a$10$/KXDoyOAyzbnu/020Am.Y.592EQ8NDu5P69OqMtHQTUg8T.FRW3CG' WHERE username = 'admin';
UPDATE users SET password_hash = '$2a$10$bhCb3JqPA9.f79MzRULSKunEoJw62pYEdJosjeun7tQa0jPts16HW' WHERE username = 'nv001';
