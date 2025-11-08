# Story 2.4: Initial Database Schema Migration (Existing Tables)

Status: ready-for-dev

## Story

As a **developer**,  
I want **the existing role/pricing tables migrated to all three Neon databases**,  
so that **the Hello World dashboard can query real data and validate database connectivity**.

## Acceptance Criteria

**Given** the migration system is set up  
**When** I create and run the initial migration  
**Then** the following tables are created in all three databases:
- Tables from existing schema (e.g., `role_profiles`, `profile_pricing`, etc.)
- Proper column types, constraints, and indexes
- Sample data inserted (optional, for Hello World query testing)

**And** the migration runs successfully against `role_directory_dev`  
**And** the migration runs successfully against `role_directory_stg`  
**And** the migration runs successfully against `role_directory_prd`  
**And** I can query the tables using `psql` or a PostgreSQL client  
**And** schema is consistent across all three environments

## Tasks / Subtasks

- [ ] Task 1: Review existing schema files (AC: Understand table structure)
  - [ ] Read existing schema files in `old_docs/sql/schema/`
  - [ ] Identify all tables needed for MVP:
    - Base reference tables: `regions`, `currencies`, `price_types`, `seniority_levels`
    - Career tables: `career_levels`, `job_families`, `career_tracks`
    - Location tables: `locations`
    - Core tables: `role_profiles`, `profile_pricing`
  - [ ] Review foreign key relationships and dependencies
  - [ ] Review indexes and constraints
  - [ ] Document table creation order (dependency chain)

- [ ] Task 2: Create initial migration files (AC: Migration files exist)
  - [ ] Create migration: `migrations/20250106000000_initial_schema.up.sql`
  - [ ] Create rollback: `migrations/20250106000000_initial_schema.down.sql`
  - [ ] Use actual timestamp: `npm run migrate:create initial_schema`
  - [ ] Note: Use timestamp format from migration system (YYYYMMDDHHMMSS)

- [ ] Task 3: Create update_updated_at_column function (AC: Trigger function exists)
  - [ ] Add to up migration:
    ```sql
    -- ============================================================================
    -- FUNCTION: update_updated_at_column
    -- Purpose: Automatically update updated_at timestamp on row updates
    -- ============================================================================
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    ```
  - [ ] Add to down migration:
    ```sql
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    ```

- [ ] Task 4: Create base reference tables (AC: Phase 1 tables created)
  - [ ] Add to up migration: `regions` table
    - Fields: `region_id` (PK), `region_name`, `region_code`, `created_at`, `updated_at`
    - Example: LATAM, North America, EMEA, APAC, Oceania
  - [ ] Add to up migration: `currencies` table
    - Fields: `currency_id` (PK), `currency_code`, `currency_name`, `currency_symbol`
    - Example: USD, EUR, BRL, GBP
  - [ ] Add to up migration: `price_types` table
    - Fields: `price_type_id` (PK), `price_type_name`, `description`
    - Example: standard, premium, discounted
  - [ ] Add to up migration: `seniority_levels` table
    - Fields: `seniority_level_id` (PK), `seniority_name`, `seniority_order`
    - Example: Junior, Mid, Senior, Principal
  - [ ] Add indexes where appropriate
  - [ ] Add to down migration: `DROP TABLE IF EXISTS` statements (reverse order)

- [ ] Task 5: Create career progression tables (AC: Phase 2 tables created)
  - [ ] Add to up migration: `career_levels` table
    - Fields: `career_level_id` (PK), `level_code`, `level_name`, `level_order`, `seniority_level_id` (FK)
    - Example: L1, L2, L3, L4, L5
    - Foreign key: References `seniority_levels`
  - [ ] Add indexes: `idx_level_code`, `idx_cl_seniority_level_id`
  - [ ] Add to down migration: DROP TABLE statement

- [ ] Task 6: Create job family structure tables (AC: Phase 3 tables created)
  - [ ] Add to up migration: `job_families` table
    - Fields: `job_family_id` (PK), `family_name`, `family_code`, `description`
    - Example: Engineering, Data, Product, Design
  - [ ] Add to up migration: `career_tracks` table
    - Fields: `career_track_id` (PK), `track_name`, `track_code`, `job_family_id` (FK), `description`
    - Example: Backend Engineering, Frontend Engineering, Data Science
    - Foreign key: References `job_families`
  - [ ] Add indexes for foreign keys and lookups
  - [ ] Add to down migration: DROP TABLE statements (reverse order)

- [ ] Task 7: Create location tables (AC: Phase 4 tables created)
  - [ ] Add to up migration: `locations` table
    - Fields: `location_id` (PK), `location_name`, `location_code`, `country_code`, `region_id` (FK)
    - Example: São Paulo, New York, London, Singapore
    - Foreign key: References `regions`
  - [ ] Add indexes: `idx_location_name`, `idx_l_region_id`
  - [ ] Add to down migration: DROP TABLE statement

- [ ] Task 8: Create role_profiles table (AC: Phase 5 table created)
  - [ ] Add to up migration: `role_profiles` table
    - Fields:
      - `profile_id` (PK VARCHAR(50))
      - `role_title` (VARCHAR(255) NOT NULL)
      - `profile_name` (VARCHAR(255) NOT NULL)
      - `profile_name_latam`, `profile_name_na`, `profile_name_emea`, `profile_name_apac`, `profile_name_oceania` (regionalized names)
      - `job_family_id` (FK, nullable)
      - `career_track_id` (FK, nullable)
      - `career_level_id` (FK NOT NULL)
      - `seniority_level_id` (FK NOT NULL)
      - `profile_description` (TEXT)
      - `created_at`, `updated_at` (TIMESTAMP)
    - Foreign keys: References `job_families`, `career_tracks`, `career_levels`, `seniority_levels`
    - Constraints: ON DELETE behavior per existing schema
  - [ ] Add trigger: `update_role_profiles_updated_at`
  - [ ] Add indexes:
    - `idx_role_title` ON `role_title`
    - `idx_profile_name` ON `profile_name`
    - `idx_rp_job_family_id`, `idx_rp_career_track_id`, `idx_rp_career_level_id`, `idx_rp_seniority_level_id`
  - [ ] Add table comment: 'Role profile definitions: Developer L3 - Sr, Data Analyst - L2 - Mid, etc.'
  - [ ] Add to down migration: DROP TABLE statement

- [ ] Task 9: Create profile_pricing table (AC: Phase 6 table created)
  - [ ] Add to up migration: `profile_pricing` table
    - Fields:
      - `pricing_id` (PK VARCHAR(50))
      - `profile_id` (FK NOT NULL)
      - `region_id` (FK NOT NULL)
      - `location_id` (FK NOT NULL)
      - `currency_id` (FK NOT NULL)
      - `price_type_id` (FK NOT NULL)
      - `annual_price` (DECIMAL(15,2) NOT NULL)
      - `hourly_rate` (DECIMAL(15,2))
      - `tax_rate_decimal` (DECIMAL(5,4))
      - `annual_price_with_tax` (DECIMAL(15,2))
      - `hourly_rate_with_tax` (DECIMAL(15,2))
      - `markup_rate_decimal` (DECIMAL(5,4))
      - `effective_date` (DATE)
      - `expiration_date` (DATE)
      - `is_active` (BOOLEAN DEFAULT TRUE)
      - `created_at`, `updated_at` (TIMESTAMP)
    - Foreign keys: References `role_profiles`, `regions`, `locations`, `currencies`, `price_types`
    - Unique constraint: `uk_pricing_unique` on (profile_id, region_id, location_id, price_type_id, effective_date)
    - Check constraints:
      - `chk_annual_price`: annual_price >= 0
      - `chk_hourly_rate`: hourly_rate >= 0 OR NULL
      - `chk_tax_rate`: tax_rate_decimal BETWEEN 0 AND 1 OR NULL
      - `chk_markup_rate`: markup_rate_decimal BETWEEN 0 AND 1 OR NULL
      - `chk_expiration_date`: expiration_date >= effective_date OR NULL
  - [ ] Add trigger: `update_profile_pricing_updated_at`
  - [ ] Add indexes:
    - `idx_pp_profile_id`, `idx_pp_region_id`, `idx_pp_location_id`, `idx_pp_currency_id`, `idx_pp_price_type_id`
    - `idx_pp_is_active`, `idx_pp_effective_date`
  - [ ] Add table and column comments
  - [ ] Add to down migration: DROP TABLE statement

- [ ] Task 10: Complete down migration (AC: Rollback drops all tables)
  - [ ] Add DROP statements in REVERSE order:
    ```sql
    -- Drop tables in reverse dependency order
    DROP TABLE IF EXISTS profile_pricing CASCADE;
    DROP TABLE IF EXISTS role_profiles CASCADE;
    DROP TABLE IF EXISTS locations CASCADE;
    DROP TABLE IF EXISTS career_tracks CASCADE;
    DROP TABLE IF EXISTS job_families CASCADE;
    DROP TABLE IF EXISTS career_levels CASCADE;
    DROP TABLE IF EXISTS seniority_levels CASCADE;
    DROP TABLE IF EXISTS price_types CASCADE;
    DROP TABLE IF EXISTS currencies CASCADE;
    DROP TABLE IF EXISTS regions CASCADE;
    
    -- Drop function
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    ```
  - [ ] Verify CASCADE will handle any dependencies

- [ ] Task 11: Add sample data (optional) (AC: Test data available)
  - [ ] Review existing sample data in `old_docs/sql/sample_data/`
  - [ ] Create separate migration (optional): `migrations/20250106000001_sample_data.up.sql`
  - [ ] Insert minimal sample data for testing:
    - 1-2 regions (e.g., LATAM, North America)
    - 1-2 currencies (e.g., USD, BRL)
    - 1 price type (e.g., standard)
    - 2-3 seniority levels (e.g., Mid, Senior)
    - 2-3 career levels (e.g., L2, L3)
    - 1-2 job families (e.g., Engineering)
    - 1-2 career tracks (e.g., Backend Engineering)
    - 1-2 locations (e.g., São Paulo, New York)
    - 1-2 role profiles (e.g., "Backend Engineer L3 - Sr")
    - 1-2 pricing records
  - [ ] Create rollback migration: `migrations/20250106000001_sample_data.down.sql`
  - [ ] Rollback: DELETE FROM tables in reverse order
  - [ ] Note: Sample data migration is OPTIONAL for MVP

- [ ] Task 12: Test migration locally (AC: Migration works on local dev database)
  - [ ] Set DATABASE_URL for dev environment:
    ```bash
    export DATABASE_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/role_directory_dev?sslmode=require"
    ```
  - [ ] Run migration status: `npm run migrate:status`
  - [ ] Expected: Show pending migration `20250106000000_initial_schema`
  - [ ] Run migration up: `npm run migrate:up`
  - [ ] Verify tables created:
    ```bash
    psql $DATABASE_URL -c "\dt"
    ```
  - [ ] Expected: List all 10 tables
  - [ ] Verify schema_migrations updated:
    ```bash
    psql $DATABASE_URL -c "SELECT * FROM schema_migrations"
    ```
  - [ ] Expected: Show `20250106000000_initial_schema` applied
  - [ ] Query sample table:
    ```bash
    psql $DATABASE_URL -c "SELECT COUNT(*) FROM role_profiles"
    ```
  - [ ] Expected: 0 rows (or sample data count if sample data migration applied)

- [ ] Task 13: Test rollback locally (AC: Rollback drops all tables)
  - [ ] Run migration down: `npm run migrate:down`
  - [ ] Verify tables dropped:
    ```bash
    psql $DATABASE_URL -c "\dt"
    ```
  - [ ] Expected: No tables listed (only schema_migrations remains)
  - [ ] Verify schema_migrations updated:
    ```bash
    psql $DATABASE_URL -c "SELECT * FROM schema_migrations"
    ```
  - [ ] Expected: `20250106000000_initial_schema` removed
  - [ ] Re-apply migration: `npm run migrate:up`
  - [ ] Verify idempotency: Migration works after rollback

- [ ] Task 14: Apply migration to staging (AC: Staging database has schema)
  - [ ] Set DATABASE_URL for staging:
    ```bash
    export DATABASE_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/role_directory_stg?sslmode=require"
    ```
  - [ ] Run migration status: `npm run migrate:status`
  - [ ] Run migration up: `npm run migrate:up`
  - [ ] Verify tables created: `psql $DATABASE_URL -c "\dt"`
  - [ ] Expected: All 10 tables created in staging
  - [ ] Document staging migration timestamp in completion notes

- [ ] Task 15: Apply migration to production (AC: Production database has schema)
  - [ ] Set DATABASE_URL for production:
    ```bash
    export DATABASE_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/role_directory_prd?sslmode=require"
    ```
  - [ ] Run migration status: `npm run migrate:status`
  - [ ] Run migration up: `npm run migrate:up`
  - [ ] Verify tables created: `psql $DATABASE_URL -c "\dt"`
  - [ ] Expected: All 10 tables created in production
  - [ ] Document production migration timestamp in completion notes
  - [ ] Verify schema consistency across all three environments:
    ```bash
    # Compare table counts
    psql $DATABASE_URL_DEV -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
    psql $DATABASE_URL_STG -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
    psql $DATABASE_URL_PRD -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
    ```
  - [ ] Expected: Same table count in all environments

- [ ] Task 16: Document schema in DATABASE.md (AC: Schema documented)
  - [ ] Update `docs/DATABASE.md` (or create if not exists)
  - [ ] Add section: "Database Schema"
  - [ ] Document all 10 tables with brief descriptions:
    - **regions**: Geographic regions (LATAM, NA, EMEA, APAC, Oceania)
    - **currencies**: Currency codes and symbols (USD, EUR, BRL)
    - **price_types**: Pricing type categories (standard, premium)
    - **seniority_levels**: Seniority progression (Junior, Mid, Senior, Principal)
    - **career_levels**: Career level codes (L1-L5) with seniority mapping
    - **job_families**: Job family categories (Engineering, Data, Product)
    - **career_tracks**: Career track specializations (Backend Engineering, Frontend Engineering)
    - **locations**: Geographic locations with region mapping
    - **role_profiles**: Role profile definitions with regionalized names
    - **profile_pricing**: Pricing records for role profiles across regions
  - [ ] Document table relationships (ERD or text description)
  - [ ] Document key constraints and indexes
  - [ ] Add example queries:
    ```sql
    -- Get all role profiles with seniority level
    SELECT rp.profile_id, rp.role_title, rp.profile_name, sl.seniority_name
    FROM role_profiles rp
    JOIN seniority_levels sl ON rp.seniority_level_id = sl.seniority_level_id;
    
    -- Get pricing for a specific profile
    SELECT pp.pricing_id, rp.profile_name, r.region_name, l.location_name, 
           pp.annual_price, c.currency_code
    FROM profile_pricing pp
    JOIN role_profiles rp ON pp.profile_id = rp.profile_id
    JOIN regions r ON pp.region_id = r.region_id
    JOIN locations l ON pp.location_id = l.location_id
    JOIN currencies c ON pp.currency_id = c.currency_id
    WHERE pp.is_active = TRUE;
    ```

- [ ] Task 17: Update README with schema information (AC: README references schema)
  - [ ] Add section: "Database Schema" in README.md
  - [ ] Link to DATABASE.md for detailed schema documentation
  - [ ] Document table count: "10 tables managing role profiles and pricing"
  - [ ] Document migration status: "Schema migrated to all three environments"

- [ ] Task 18: Verify migration system integration (AC: Migration tracked correctly)
  - [ ] Query schema_migrations table in all three environments:
    ```bash
    psql $DATABASE_URL_DEV -c "SELECT version, applied_at FROM schema_migrations ORDER BY applied_at"
    psql $DATABASE_URL_STG -c "SELECT version, applied_at FROM schema_migrations ORDER BY applied_at"
    psql $DATABASE_URL_PRD -c "SELECT version, applied_at FROM schema_migrations ORDER BY applied_at"
    ```
  - [ ] Expected: `20250106000000_initial_schema` in all three environments
  - [ ] Verify migration timestamps are different (applied at different times)
  - [ ] Document migration history in completion notes

## Dev Notes

### Technical Context

**Architecture References:**
- **Epic 2 Tech Spec**: Initial schema migration requirements
- **Architecture Decision**: SQL-based migrations (not ORM)
- **Existing Schema**: `old_docs/sql/schema/*.sql` (10 table files)
- **PRD**: Role/pricing data model for directory features

**Key Implementation Details:**

1. **Table Dependencies (Migration Order):**
   ```
   PHASE 1: Base Reference Tables (no dependencies)
   ├── regions
   ├── currencies
   ├── price_types
   └── seniority_levels
   
   PHASE 2: Career Progression Chain
   └── career_levels (depends on seniority_levels)
   
   PHASE 3: Job Family Structure
   ├── job_families
   └── career_tracks (depends on job_families)
   
   PHASE 4: Geographic Data
   └── locations (depends on regions)
   
   PHASE 5: Role Profiles
   └── role_profiles (depends on job_families, career_tracks, career_levels, seniority_levels)
   
   PHASE 6: Pricing Data
   └── profile_pricing (depends on role_profiles, regions, locations, currencies, price_types)
   ```

2. **Migration File Structure:**
   ```
   role-directory/
   ├── migrations/
   │   ├── 000_create_schema_migrations.sql       # Bootstrap (from Story 2.3)
   │   ├── 20250106000000_initial_schema.up.sql   # THIS STORY
   │   ├── 20250106000000_initial_schema.down.sql # THIS STORY
   │   ├── 20250106000001_sample_data.up.sql      # OPTIONAL
   │   └── 20250106000001_sample_data.down.sql    # OPTIONAL
   ```

3. **Key Tables Summary:**

   **role_profiles** (Core table):
   ```sql
   CREATE TABLE role_profiles (
       profile_id VARCHAR(50) PRIMARY KEY,
       role_title VARCHAR(255) NOT NULL,
       profile_name VARCHAR(255) NOT NULL,
       profile_name_latam VARCHAR(255),
       profile_name_na VARCHAR(255),
       profile_name_emea VARCHAR(255),
       profile_name_apac VARCHAR(255),
       profile_name_oceania VARCHAR(255),
       job_family_id VARCHAR(50),
       career_track_id VARCHAR(50),
       career_level_id VARCHAR(50) NOT NULL,
       seniority_level_id VARCHAR(50) NOT NULL,
       profile_description TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       
       -- Foreign key constraints
       CONSTRAINT fk_role_profiles_job_family 
           FOREIGN KEY (job_family_id) REFERENCES job_families(job_family_id),
       CONSTRAINT fk_role_profiles_career_track 
           FOREIGN KEY (career_track_id) REFERENCES career_tracks(career_track_id),
       CONSTRAINT fk_role_profiles_career_level 
           FOREIGN KEY (career_level_id) REFERENCES career_levels(career_level_id),
       CONSTRAINT fk_role_profiles_seniority_level 
           FOREIGN KEY (seniority_level_id) REFERENCES seniority_levels(seniority_level_id)
   );
   
   -- Indexes
   CREATE INDEX idx_role_title ON role_profiles(role_title);
   CREATE INDEX idx_profile_name ON role_profiles(profile_name);
   CREATE INDEX idx_rp_job_family_id ON role_profiles(job_family_id);
   CREATE INDEX idx_rp_career_track_id ON role_profiles(career_track_id);
   CREATE INDEX idx_rp_career_level_id ON role_profiles(career_level_id);
   CREATE INDEX idx_rp_seniority_level_id ON role_profiles(seniority_level_id);
   
   -- Trigger
   CREATE TRIGGER update_role_profiles_updated_at BEFORE UPDATE ON role_profiles
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

   **profile_pricing** (Core table):
   ```sql
   CREATE TABLE profile_pricing (
       pricing_id VARCHAR(50) PRIMARY KEY,
       profile_id VARCHAR(50) NOT NULL,
       region_id VARCHAR(50) NOT NULL,
       location_id VARCHAR(50) NOT NULL,
       currency_id VARCHAR(3) NOT NULL,
       price_type_id VARCHAR(50) NOT NULL,
       annual_price DECIMAL(15, 2) NOT NULL,
       hourly_rate DECIMAL(15, 2),
       tax_rate_decimal DECIMAL(5, 4),
       annual_price_with_tax DECIMAL(15, 2),
       hourly_rate_with_tax DECIMAL(15, 2),
       markup_rate_decimal DECIMAL(5, 4),
       effective_date DATE,
       expiration_date DATE,
       is_active BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       
       -- Foreign keys
       CONSTRAINT fk_profile_pricing_profile 
           FOREIGN KEY (profile_id) REFERENCES role_profiles(profile_id),
       CONSTRAINT fk_profile_pricing_region 
           FOREIGN KEY (region_id) REFERENCES regions(region_id),
       CONSTRAINT fk_profile_pricing_location 
           FOREIGN KEY (location_id) REFERENCES locations(location_id),
       CONSTRAINT fk_profile_pricing_currency 
           FOREIGN KEY (currency_id) REFERENCES currencies(currency_id),
       CONSTRAINT fk_profile_pricing_price_type 
           FOREIGN KEY (price_type_id) REFERENCES price_types(price_type_id),
       
       -- Unique constraint
       CONSTRAINT uk_pricing_unique UNIQUE (profile_id, region_id, location_id, price_type_id, effective_date),
       
       -- Check constraints
       CONSTRAINT chk_annual_price CHECK (annual_price >= 0),
       CONSTRAINT chk_hourly_rate CHECK (hourly_rate >= 0 OR hourly_rate IS NULL),
       CONSTRAINT chk_tax_rate CHECK (tax_rate_decimal BETWEEN 0 AND 1 OR tax_rate_decimal IS NULL),
       CONSTRAINT chk_markup_rate CHECK (markup_rate_decimal BETWEEN 0 AND 1 OR markup_rate_decimal IS NULL),
       CONSTRAINT chk_expiration_date CHECK (expiration_date >= effective_date OR expiration_date IS NULL)
   );
   ```

4. **Migration Execution Workflow:**
   ```bash
   # DEVELOPMENT ENVIRONMENT
   # 1. Set DATABASE_URL
   export DATABASE_URL="postgresql://user:pass@ep-dev.neon.tech/role_directory_dev?sslmode=require"
   
   # 2. Check migration status
   npm run migrate:status
   # Expected output:
   #   ✅ 000_create_schema_migrations (applied 2025-11-06 10:00:00)
   #   ❌ 20250106000000_initial_schema (pending)
   
   # 3. Apply migration
   npm run migrate:up
   # Expected output:
   #   ✓ 000_create_schema_migrations (already applied)
   #   ⏳ Applying 20250106000000_initial_schema...
   #   ✅ 20250106000000_initial_schema applied
   #   ✅ All migrations applied successfully
   
   # 4. Verify tables created
   psql $DATABASE_URL -c "\dt"
   # Expected: 10 tables listed
   
   # 5. Verify migration tracked
   psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY applied_at"
   # Expected: Two rows (bootstrap + initial_schema)
   
   # STAGING ENVIRONMENT
   # Repeat steps 1-5 with staging DATABASE_URL
   export DATABASE_URL="postgresql://user:pass@ep-stg.neon.tech/role_directory_stg?sslmode=require"
   npm run migrate:up
   
   # PRODUCTION ENVIRONMENT
   # Repeat steps 1-5 with production DATABASE_URL
   export DATABASE_URL="postgresql://user:pass@ep-prd.neon.tech/role_directory_prd?sslmode=require"
   npm run migrate:up
   ```

5. **Rollback Workflow (Testing):**
   ```bash
   # 1. Roll back last migration
   npm run migrate:down
   # Expected output:
   #   🔄 Rolling back last migration...
   #   ⏳ Rolling back 20250106000000_initial_schema...
   #   ✅ 20250106000000_initial_schema rolled back
   
   # 2. Verify tables dropped
   psql $DATABASE_URL -c "\dt"
   # Expected: Only schema_migrations table remains
   
   # 3. Re-apply migration (test idempotency)
   npm run migrate:up
   # Expected: Migration applies successfully again
   ```

6. **Sample Data Migration (Optional):**
   ```sql
   -- migrations/20250106000001_sample_data.up.sql
   
   -- Insert sample regions
   INSERT INTO regions (region_id, region_name, region_code) VALUES
   ('LATAM', 'Latin America', 'LATAM'),
   ('NA', 'North America', 'NA');
   
   -- Insert sample currencies
   INSERT INTO currencies (currency_id, currency_code, currency_name, currency_symbol) VALUES
   ('USD', 'USD', 'US Dollar', '$'),
   ('BRL', 'BRL', 'Brazilian Real', 'R$');
   
   -- Insert sample price types
   INSERT INTO price_types (price_type_id, price_type_name, description) VALUES
   ('STANDARD', 'Standard', 'Standard market pricing');
   
   -- Insert sample seniority levels
   INSERT INTO seniority_levels (seniority_level_id, seniority_name, seniority_order) VALUES
   ('MID', 'Mid', 2),
   ('SENIOR', 'Senior', 3);
   
   -- Insert sample career levels
   INSERT INTO career_levels (career_level_id, level_code, level_name, level_order, seniority_level_id) VALUES
   ('L2', 'L2', 'Level 2', 2, 'MID'),
   ('L3', 'L3', 'Level 3', 3, 'SENIOR');
   
   -- Insert sample job families
   INSERT INTO job_families (job_family_id, family_name, family_code, description) VALUES
   ('ENG', 'Engineering', 'ENG', 'Software Engineering roles');
   
   -- Insert sample career tracks
   INSERT INTO career_tracks (career_track_id, track_name, track_code, job_family_id, description) VALUES
   ('BACKEND', 'Backend Engineering', 'BACKEND', 'ENG', 'Backend software development');
   
   -- Insert sample locations
   INSERT INTO locations (location_id, location_name, location_code, country_code, region_id) VALUES
   ('SAO_PAULO', 'São Paulo', 'SP', 'BR', 'LATAM'),
   ('NEW_YORK', 'New York', 'NY', 'US', 'NA');
   
   -- Insert sample role profiles
   INSERT INTO role_profiles (profile_id, role_title, profile_name, job_family_id, career_track_id, career_level_id, seniority_level_id, profile_description) VALUES
   ('BE-L3-SR', 'Backend Engineer L3', 'Backend Engineer - Senior', 'ENG', 'BACKEND', 'L3', 'SENIOR', 'Senior backend engineer with 5+ years experience');
   
   -- Insert sample pricing
   INSERT INTO profile_pricing (pricing_id, profile_id, region_id, location_id, currency_id, price_type_id, annual_price, hourly_rate, is_active, effective_date) VALUES
   ('BE-L3-SR-LATAM-SP', 'BE-L3-SR', 'LATAM', 'SAO_PAULO', 'BRL', 'STANDARD', 180000.00, 90.00, TRUE, '2025-01-01'),
   ('BE-L3-SR-NA-NY', 'BE-L3-SR', 'NA', 'NEW_YORK', 'USD', 'STANDARD', 150000.00, 75.00, TRUE, '2025-01-01');
   ```

   Rollback:
   ```sql
   -- migrations/20250106000001_sample_data.down.sql
   
   -- Delete in reverse dependency order
   DELETE FROM profile_pricing;
   DELETE FROM role_profiles;
   DELETE FROM locations;
   DELETE FROM career_tracks;
   DELETE FROM job_families;
   DELETE FROM career_levels;
   DELETE FROM seniority_levels;
   DELETE FROM price_types;
   DELETE FROM currencies;
   DELETE FROM regions;
   ```

### Project Structure Notes

**Files Created/Modified:**
```
role-directory/
├── migrations/
│   ├── 20250106000000_initial_schema.up.sql      # NEW: Schema migration
│   ├── 20250106000000_initial_schema.down.sql    # NEW: Schema rollback
│   ├── 20250106000001_sample_data.up.sql         # NEW: Sample data (OPTIONAL)
│   └── 20250106000001_sample_data.down.sql       # NEW: Sample data rollback (OPTIONAL)
├── docs/
│   └── DATABASE.md                               # MODIFIED: Schema documentation
└── README.md                                     # MODIFIED: Add schema reference
```

**Schema Source Files (Reference Only):**
- `old_docs/sql/schema/01_regions.sql`
- `old_docs/sql/schema/02_currencies.sql`
- `old_docs/sql/schema/03_price_types.sql`
- `old_docs/sql/schema/04_seniority_levels.sql`
- `old_docs/sql/schema/06_career_levels.sql`
- `old_docs/sql/schema/07_job_families.sql`
- `old_docs/sql/schema/08_career_tracks.sql`
- `old_docs/sql/schema/09_locations.sql`
- `old_docs/sql/schema/10_role_profiles.sql`
- `old_docs/sql/schema/11_profile_pricing.sql`

### Testing Standards Summary

**For This Story:**
- **Manual Testing**: Apply and rollback migrations in all three environments
- **Verification Steps**:
  1. Create migration files with `npm run migrate:create initial_schema`
  2. Copy schema from existing SQL files to up migration (10 tables)
  3. Create down migration with DROP TABLE statements (reverse order)
  4. Test in dev:
     - Set DATABASE_URL for dev
     - Run `npm run migrate:status` (should show pending)
     - Run `npm run migrate:up` (should succeed)
     - Verify tables: `psql $DATABASE_URL -c "\dt"` (should show 10 tables)
     - Run `npm run migrate:down` (should succeed)
     - Verify tables dropped: `psql $DATABASE_URL -c "\dt"` (no tables except schema_migrations)
     - Re-apply: `npm run migrate:up` (should succeed again)
  5. Apply to staging:
     - Set DATABASE_URL for staging
     - Run `npm run migrate:up`
     - Verify tables created
  6. Apply to production:
     - Set DATABASE_URL for production
     - Run `npm run migrate:up`
     - Verify tables created
  7. Verify schema consistency:
     - Query table count in all three environments
     - Should be identical (10 tables + schema_migrations)

**Expected Results:**
- Migration creates 10 tables in correct dependency order
- All tables have proper foreign keys, indexes, and constraints
- Migration tracked in schema_migrations table
- Rollback drops all tables cleanly
- Migration can be re-applied after rollback (idempotent)
- Schema is identical across dev, staging, and production

### Constraints and Patterns

**MUST Follow:**
1. **Migration Order** (Epic 2 Tech Spec):
   - Create tables in dependency order (base tables first)
   - Drop tables in REVERSE order (dependent tables first)
   - Use CASCADE carefully (only when appropriate)

2. **Foreign Key Constraints** (existing schema):
   - ON DELETE behavior matches existing schema:
     - Role profiles: SET NULL for optional FKs, RESTRICT for required FKs
     - Profile pricing: CASCADE on role_profiles (pricing deleted with profile)
   - ON UPDATE CASCADE for all FKs (propagate ID changes)

3. **Indexes Required** (Epic 2 Tech Spec):
   - Primary keys (automatic)
   - Foreign keys (for join performance)
   - Lookup columns (role_title, profile_name, location_name)
   - Active status flags (is_active for pricing queries)

4. **Triggers Required** (existing schema):
   - updated_at triggers on role_profiles and profile_pricing
   - Use shared update_updated_at_column() function

5. **Neon PostgreSQL Compatibility** (architecture.md):
   - Use PostgreSQL 17.0 syntax (Neon version)
   - Avoid Neon-specific features not in standard PostgreSQL
   - Test cold start behavior (first query may be slow)

6. **Documentation Required** (architecture.md):
   - Document all 10 tables in DATABASE.md
   - Document table relationships (dependencies)
   - Provide example queries for common use cases
   - Link README to DATABASE.md

### References

- [Source: docs/2-planning/epics.md#Story-2.4] - Story definition and acceptance criteria
- [Source: docs/3-solutioning/tech-spec-epic-2.md#Initial-Schema] - Technical specification
- [Source: docs/3-solutioning/architecture.md#Database] - Database decisions
- [Source: old_docs/sql/schema/*.sql] - Existing table definitions (10 files)
- [Source: old_docs/sql/run_all_schema.sql] - Migration order reference

### Learnings from Previous Story

**From Story 2-3 (Status: drafted):**
- Story 2.3 not yet implemented - no completion learnings available
- Will incorporate learnings once Story 2.3 is completed

**Expected Dependencies from Previous Stories:**
- ✅ Story 1.1 (done): Project structure, Node.js installed
- ✅ Story 2.1 (drafted): Neon databases created, DATABASE_URL available
- ✅ Story 2.2 (drafted): Database connection module (lib/db.ts) exists
- ✅ Story 2.3 (drafted): Migration system (scripts/migrate.js) works

**Assumptions:**
- DATABASE_URL available for all three environments
- Migration system tested and working (Story 2.3)
- Developer has PostgreSQL client (psql) installed
- Developer can access Neon databases via connection string
- Existing schema files in old_docs/sql/schema/ are accurate

**Important Notes:**
- This story creates the **actual database schema** for the role directory
- **10 tables** with proper foreign keys, indexes, and constraints
- **Sample data migration is OPTIONAL** for MVP (can insert data manually later)
- Migration must be applied to **all three environments** (dev, staging, production)
- Schema must be **consistent across environments** (verified by table count query)
- **Rollback tested in dev only** (not in staging/production unless absolutely necessary)
- Next story (2.5) will integrate database connectivity into health check endpoint

## Dev Agent Record

### Context Reference

- `docs/stories/2-4-initial-database-schema-migration.context.xml` - Generated 2025-11-07

### Agent Model Used

<!-- Fill in when implementing: e.g., Claude Sonnet 4.5 -->

### Debug Log References

<!-- Add links to debug logs or issues encountered during implementation -->

### Completion Notes List

<!-- Dev agent fills in after completing story:
- New patterns/services created
- Architectural deviations or decisions made
- Technical debt deferred to future stories
- Warnings or recommendations for next story
- Interfaces/methods created for reuse
-->

### File List

<!-- Dev agent fills in after completing story:
Format: [STATUS] path/to/file.ext
- NEW: file created
- MODIFIED: file changed
- DELETED: file removed
-->

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-06 | danielvm (SM - Bob) | Initial story creation from epics.md |


