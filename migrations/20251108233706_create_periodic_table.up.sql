-- Up migration: create_periodic_table
-- Created: 2025-11-09T00:37:06Z
-- Creates periodic table structure (sample data from Neon)
-- Note: This creates the table structure only. Data can be loaded separately.

CREATE TABLE IF NOT EXISTS public.periodic_table (
    "AtomicNumber" integer NOT NULL PRIMARY KEY,
    "Element" text,
    "Symbol" text,
    "AtomicMass" numeric,
    "NumberOfNeutrons" integer,
    "NumberOfProtons" integer,
    "NumberOfElectrons" integer,
    "Period" integer,
    "Group" integer,
    "Phase" text,
    "Radioactive" boolean,
    "Natural" boolean,
    "Metal" boolean,
    "Nonmetal" boolean,
    "Metalloid" boolean,
    "Type" text,
    "AtomicRadius" numeric,
    "Electronegativity" numeric,
    "FirstIonization" numeric,
    "Density" numeric,
    "MeltingPoint" numeric,
    "BoilingPoint" numeric,
    "NumberOfIsotopes" integer,
    "Discoverer" text,
    "Year" integer,
    "SpecificHeat" numeric,
    "NumberOfShells" integer,
    "NumberOfValence" integer
);

-- Insert a sample element (Neon) to demonstrate the table works
INSERT INTO public.periodic_table 
  ("AtomicNumber", "Element", "Symbol", "AtomicMass", "NumberOfNeutrons", "NumberOfProtons", 
   "NumberOfElectrons", "Period", "Group", "Phase", "Radioactive", "Natural", "Metal", 
   "Nonmetal", "Metalloid", "Type", "AtomicRadius", "Electronegativity", "FirstIonization", 
   "Density", "MeltingPoint", "BoilingPoint", "NumberOfIsotopes", "Discoverer", "Year", 
   "SpecificHeat", "NumberOfShells", "NumberOfValence")
VALUES 
  (10, 'Neon', 'Ne', 20.18, 10, 10, 10, 2, 18, 'gas', NULL, true, NULL, true, NULL, 
   'Noble Gas', 0.51, NULL, 21.5645, 0.000900, 24.703, 27.07, 8, 'Ramsay and Travers', 
   1898, 1.03, 2, 8)
ON CONFLICT ("AtomicNumber") DO NOTHING;

-- Add a comment to the table
COMMENT ON TABLE public.periodic_table IS 'Periodic table of elements - sample data structure from Neon';
