-- Les nouveaux comptes ne doivent pas devenir administrateurs par défaut.
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'COLLABORATOR';
