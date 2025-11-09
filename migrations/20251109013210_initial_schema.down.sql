-- Down migration: initial_schema
-- Created: 2025-11-09
-- Story 2.4: Initial Database Schema Migration - Rollback
--
-- Drops periodic_table

DROP TABLE IF EXISTS periodic_table CASCADE;
