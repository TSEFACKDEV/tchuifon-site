-- Ajout du niveau Master professionnel dans l'ordre logique des niveaux.
ALTER TYPE "SupervisionLevel" ADD VALUE 'MASTER_PROFESSIONNEL' BEFORE 'DOCTORAT';
