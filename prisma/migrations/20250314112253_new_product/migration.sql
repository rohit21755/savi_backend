-- AlterTable
CREATE SEQUENCE variant_id_seq;
ALTER TABLE "Variant" ALTER COLUMN "id" SET DEFAULT nextval('variant_id_seq');
ALTER SEQUENCE variant_id_seq OWNED BY "Variant"."id";
