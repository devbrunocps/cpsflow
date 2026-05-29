-- Drop company_instances since we are reverting
DROP TABLE IF EXISTS public.company_instances CASCADE;

-- We want to use company_integrations for instances, so it can have multiple rows per company.
-- Drop the unique constraint on company_id if it exists.
DO $$
DECLARE
    con_name text;
BEGIN
    SELECT constraint_name INTO con_name
    FROM information_schema.table_constraints
    WHERE table_name = 'company_integrations'
      AND constraint_type = 'UNIQUE'
      AND table_schema = 'public'
    LIMIT 1;

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.company_integrations DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;
END $$;

-- Add label and active columns
ALTER TABLE public.company_integrations ADD COLUMN IF NOT EXISTS label text;
ALTER TABLE public.company_integrations ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
