-- Обновляем значения в таблице Product
UPDATE "Product"
SET "type" = CASE
    WHEN "type" = 'Кольцо' THEN 'RING'
    WHEN "type" = 'Запонки' THEN 'CUFFLINKS'
    WHEN "type" = 'Брошь' THEN 'BROOCH'
    WHEN "type" = 'Кулон' THEN 'PENDANT'
    WHEN "type" = 'Часы' THEN 'WATCH'
    WHEN "type" = 'Подвеска' THEN 'NECKLACE'
    WHEN "type" = 'Цепочка' THEN 'CHAIN'
    WHEN "type" = 'Серьги' THEN 'EARRINGS'
    WHEN "type" = 'Браслет' THEN 'BRACELET'
    WHEN "type" = 'Индивидуальный_заказ' THEN 'CUSTOM_ORDER'
    ELSE "type"
END; 