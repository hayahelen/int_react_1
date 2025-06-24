-- -- backend/src/migrations/schema.sql

-- -- products
-- CREATE TABLE IF NOT EXISTS products (
--   id                     SERIAL PRIMARY KEY,
--   title                  TEXT NOT NULL,
--   description            TEXT,
--   price                  NUMERIC(10,2),
--   discount_percentage    NUMERIC(5,2),
--   rating                 NUMERIC(3,2),
--   stock                  INT,
--   minimum_order_quantity INT,
--   brand                  TEXT,
--   category               TEXT,
--   sku                    TEXT,
--   weight                 NUMERIC(8,3),
--   width                  NUMERIC(8,3),
--   height                 NUMERIC(8,3),
--   depth                  NUMERIC(8,3),
--   availability_status    TEXT,
--   warranty_information   TEXT,
--   shipping_information   TEXT,
--   return_policy          TEXT
-- );

-- -- product_images
-- CREATE TABLE IF NOT EXISTS product_images (
--   id            SERIAL PRIMARY KEY,
--   product_id    INT   REFERENCES products(id) ON DELETE CASCADE,
--   url           TEXT,
--   is_thumbnail  BOOLEAN DEFAULT FALSE
-- );

-- -- tags
-- CREATE TABLE IF NOT EXISTS tags (
--   id    SERIAL PRIMARY KEY,
--   name  TEXT UNIQUE
-- );

-- -- product_tags
-- CREATE TABLE IF NOT EXISTS product_tags (
--   product_id INT REFERENCES products(id) ON DELETE CASCADE,
--   tag_id     INT REFERENCES tags(id) ON DELETE CASCADE,
--   PRIMARY KEY(product_id, tag_id)
-- );

-- -- reviews
-- CREATE TABLE IF NOT EXISTS reviews (
--   id              SERIAL PRIMARY KEY,
--   product_id      INT REFERENCES products(id) ON DELETE CASCADE,
--   rating          NUMERIC(2,1),
--   comment         TEXT,
--   reviewer_name   TEXT,
--   reviewer_email  TEXT,
--   review_date     DATE
-- );

-- -- product_meta
-- CREATE TABLE IF NOT EXISTS product_meta (
--   product_id  INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
--   created_at  TIMESTAMP,
--   updated_at  TIMESTAMP,
--   barcode     TEXT,
--   qr_code     TEXT
-- );


-- backend/src/migrations/schema.sql

DROP TABLE IF EXISTS product_meta CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_dimensions CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- products
CREATE TABLE IF NOT EXISTS products (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  discount_percentage NUMERIC(5,2),
  rating NUMERIC(3,2),
  stock INT,
  minimum_order_quantity INT,
  brand TEXT,
  category TEXT,
  sku TEXT,
  weight NUMERIC(8,3),
  availability_status TEXT,
  warranty_information TEXT,
  shipping_information TEXT,
  return_policy TEXT
);

-- dimensions
CREATE TABLE IF NOT EXISTS product_dimensions (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  width NUMERIC(8,3),
  height NUMERIC(8,3),
  depth NUMERIC(8,3)
);

-- product_images
CREATE TABLE IF NOT EXISTS product_images (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT,
  is_thumbnail BOOLEAN DEFAULT FALSE
);

-- tags
CREATE TABLE IF NOT EXISTS tags (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE
);

-- product_tags
CREATE TABLE IF NOT EXISTS product_tags (
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(product_id, tag_id)
);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  rating NUMERIC(2,1),
  comment TEXT,
  reviewer_name TEXT,
  reviewer_email TEXT,
  review_date 
  DATE
);

-- product_meta
CREATE TABLE IF NOT EXISTS product_meta (
  product_id INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  barcode TEXT,
  qr_code TEXT
);
