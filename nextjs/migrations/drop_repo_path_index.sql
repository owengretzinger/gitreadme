-- Drop the unique index on repo_path to allow multiple READMEs for the same repository
DROP INDEX IF EXISTS "repo_path_idx";

-- We're keeping the compound unique index on (repo_path, short_id) to ensure uniqueness
-- of the combination, which allows multiple READMEs per repository as long as they
-- have different shortIds 