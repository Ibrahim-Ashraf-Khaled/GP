DO $$
DECLARE
    area_data_type TEXT;
    has_floor_area BOOLEAN;
    has_legacy_area_numeric BOOLEAN;
BEGIN
    SELECT c.data_type
    INTO area_data_type
    FROM information_schema.columns AS c
    WHERE c.table_schema = 'public'
        AND c.table_name = 'properties'
        AND c.column_name = 'area';

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'properties'
            AND column_name = 'floor_area'
    )
    INTO has_floor_area;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'properties'
            AND column_name = 'legacy_area_numeric'
    )
    INTO has_legacy_area_numeric;

    -- Older hosted schemas used "area" as the numeric floor-size column.
    -- Preserve that value under floor_area, then free "area" for the text location area.
    IF area_data_type IS NOT NULL
        AND area_data_type NOT IN ('text', 'character varying')
    THEN
        IF NOT has_floor_area THEN
            EXECUTE 'ALTER TABLE public.properties ADD COLUMN floor_area INTEGER';
            has_floor_area := TRUE;
        END IF;

        EXECUTE $sql$
            UPDATE public.properties
            SET floor_area = COALESCE(
                floor_area,
                CASE
                    WHEN area IS NULL THEN NULL
                    ELSE ROUND(area::numeric)::INTEGER
                END
            )
            WHERE area IS NOT NULL
                AND floor_area IS NULL
        $sql$;

        IF NOT has_legacy_area_numeric THEN
            EXECUTE 'ALTER TABLE public.properties RENAME COLUMN area TO legacy_area_numeric';
        END IF;
    END IF;
END $$;

ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS area TEXT,
    ADD COLUMN IF NOT EXISTS floor_area INTEGER;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'properties'
            AND column_name = 'location'
    ) THEN
        UPDATE public.properties
        SET
            location_lat = COALESCE(
                location_lat,
                CAST(NULLIF(location->>'lat', '') AS DOUBLE PRECISION)
            ),
            location_lng = COALESCE(
                location_lng,
                CAST(NULLIF(location->>'lng', '') AS DOUBLE PRECISION)
            ),
            address = COALESCE(address, location->>'address'),
            area = COALESCE(area, location->>'area')
        WHERE location IS NOT NULL
            AND (
                location_lat IS NULL
                OR location_lng IS NULL
                OR address IS NULL
                OR area IS NULL
            );
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
