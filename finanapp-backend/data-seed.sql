-- =====================================================
-- FinanApp - Semilla de Datos Iniciales (Categorías Base)
-- =====================================================
-- Ejecutar en PostgreSQL sobre la base de datos 'finanapp_db'
-- después de iniciar el backend por primera vez.

-- 1. Categorías Globales de Ingreso (usuario_id = NULL)
INSERT INTO categorias (nombre, tipo, icono, usuario_id) VALUES 
('Salario / Nómina', 'INGRESO', '💰', NULL),
('Ventas / Comercio', 'INGRESO', '🛒', NULL),
('Servicios / Honorarios', 'INGRESO', '💼', NULL),
('Otros Ingresos', 'INGRESO', '💵', NULL)
ON CONFLICT DO NOTHING;

-- 2. Categorías Globales de Gasto (usuario_id = NULL)
INSERT INTO categorias (nombre, tipo, icono, usuario_id) VALUES 
('Alimentación', 'GASTO', '🍔', NULL),
('Transporte / Gasolina', 'GASTO', '🛵', NULL),
('Vivienda y Servicios', 'GASTO', '🏠', NULL),
('Salud y Medicinas', 'GASTO', '💊', NULL),
('Educación', 'GASTO', '📚', NULL),
('Ahorro', 'GASTO', '🐖', NULL),
('Pago de Deuda', 'GASTO', '💳', NULL),
('Ocio y Entretenimiento', 'GASTO', '🎉', NULL)
ON CONFLICT DO NOTHING;
