-- Run this ONCE on an existing petcare database (it does not drop or change any existing data).
USE petcare;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_ref VARCHAR(30) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  pet_id INT UNSIGNED NULL,
  total DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'sgd',
  payment_status VARCHAR(20) NOT NULL,        -- from the mock payment provider, e.g. APPROVED
  order_status VARCHAR(20) NOT NULL,          -- e.g. CONFIRMED
  provider_payment_id VARCHAR(60) NULL,
  appointment_at DATETIME NULL,               -- set when the order contains a service
  estimated_delivery DATE NULL,               -- set when the order contains a product
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_user_id (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_orders_pet
    FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  item_id INT UNSIGNED NOT NULL,
  item_name VARCHAR(100) NOT NULL,            -- name and price are copied at purchase time
  item_type ENUM('service','product') NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  INDEX idx_order_items_order_id (order_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;
