-- Run once on a database with the original vocal/palabra/recurso schema.
-- A word without a resource remains present with null media URLs.
BEGIN;
LOCK TABLE public.vocal, public.palabra, public.recurso IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.recurso GROUP BY palabra_id HAVING COUNT(*) > 1) THEN
        RAISE EXCEPTION 'Migration stopped: some words have multiple resources; resolve them before merging';
    END IF;
END $$;

ALTER TABLE public.palabra
    ADD COLUMN vocal VARCHAR(1),
    ADD COLUMN url_imagen TEXT,
    ADD COLUMN url_audio TEXT;

UPDATE public.palabra p
SET vocal = v.letra
FROM public.vocal v
WHERE p.vocal_id = v.id;

UPDATE public.palabra p
SET url_imagen = r.url_imagen, url_audio = r.url_audio
FROM public.recurso r
WHERE r.palabra_id = p.id;

ALTER TABLE public.palabra ALTER COLUMN vocal SET NOT NULL;
DROP TABLE public.recurso;
ALTER TABLE public.palabra DROP COLUMN vocal_id;
DROP TABLE public.vocal;
CREATE INDEX palabra_vocal_dificultad_idx ON public.palabra (vocal, dificultad);
COMMIT;
