WITH normalized_features AS (
    SELECT
        p.id,
        ARRAY_AGG(
            CASE feature_value
                WHEN 'تكييف' THEN 'ac'
                WHEN 'واي فاي' THEN 'wifi'
                WHEN 'قريب من البحر' THEN 'sea_close'
                WHEN 'موقف سيارة' THEN 'parking'
                WHEN 'مطبخ مجهز' THEN 'kitchen'
                WHEN 'شرفة' THEN 'balcony'
                WHEN 'إطلالة بحرية' THEN 'sea_view'
                WHEN 'أثاث كامل' THEN 'furnished'
                WHEN 'غسالة' THEN 'washer'
                WHEN 'تلفزيون' THEN 'tv'
                WHEN 'سخان مياه' THEN 'heater'
                WHEN 'مصعد' THEN 'elevator'
                ELSE feature_value
            END
            ORDER BY feature_index
        ) AS features
    FROM public.properties AS p
    CROSS JOIN LATERAL unnest(p.features) WITH ORDINALITY AS feature_items(feature_value, feature_index)
    WHERE p.features IS NOT NULL
        AND cardinality(p.features) > 0
    GROUP BY p.id
)
UPDATE public.properties AS p
SET features = normalized_features.features
FROM normalized_features
WHERE p.id = normalized_features.id
    AND p.features IS DISTINCT FROM normalized_features.features;

NOTIFY pgrst, 'reload schema';
