-- Datos demo para PostgreSQL
-- Password de demo@quickrescue.pe : "demo1234"

INSERT INTO usuarios (nombre, apellido, dni, email, password_hash, fecha_nacimiento, direccion, distrito, provincia)
VALUES
  ('María', 'Pérez Soto', '12345678', 'demo@quickrescue.pe',
   '$2b$10$5e6FKMpDDquDZSBzxGxGu.5LcZoYK4zMLxVNAGYxxd7iv0MuVktAi',
   '1948-03-15', 'Av. Los Pinos 123', 'San Isidro', 'Lima');

INSERT INTO historial_medico (usuario_id, alergias, enfermedades, medicamentos, grupo_sanguineo)
VALUES
  (1, 'Penicilina', 'Hipertensión, Alzheimer leve',
      'Losartán 50mg c/12h, Donepezilo 5mg c/24h', 'O+');

INSERT INTO familiares (usuario_id, nombre, telefono, email, relacion) VALUES
  (1, 'Juan Pérez',  '+51987654321', 'juan@example.com',  'Hijo'),
  (1, 'Lucía Pérez', '+51912345678', 'lucia@example.com', 'Hija');

INSERT INTO ubicaciones (usuario_id, latitud, longitud, precision_m, es_sos)
VALUES
  (1, -12.0972400, -77.0364200, 12, FALSE),
  (1, -12.0972500, -77.0364300, 10, FALSE);
