# Role Normalization Summary Report

**Date:** November 11, 2025  
**Source File:** `unique-roles-2025-11-final.csv`  
**Output Files:**
- `unique-roles-2025-11-normalized.csv` (main output)
- `unmapped-roles-report.csv` (unmapped roles requiring review)

## Executive Summary

Successfully normalized **7,010 unique employee logins** from the denormalized role structure into a comprehensive global role directory based on the career paths framework.

### Success Metrics

- ✅ **97.6%** mapping success rate (6,845 employees)
- ⚠️ **2.4%** require manual review (165 employees)
- ✅ **21 out of 23** Role Base Names fully mapped (91.3% coverage)
- ✅ **56 unique role combinations** mapped to normalized structure

## Mapping Results

### Successfully Mapped Role Types

All of the following role base names achieved **100% mapping success**:

1. **Developer** (3,566 employees) → Technology & Development | Software Development
2. **QA** (669 employees) → Technology & Development | Quality Assurance
3. **Software Architect** (339 employees) → Technology & Development | Software Architecture
4. **Systems Architect** (225 employees) → Technology & Development | Software Architecture
5. **Scrum Master** (302 employees) → Delivery & Operations | Agile/Scrum Leadership
6. **Squad Leader** (202 employees) → Delivery & Operations | Agile/Scrum Leadership
7. **Data Developer** (276 employees) → Data & AI | Data Development
8. **Data Analyst** (118 employees) → Data & AI | Data Analysis
9. **Data Scientist** (45 employees) → Data & AI | Data Science
10. **Business Analyst** (85 employees) → Product & Business | Business Analysis
11. **Project Manager** (84 employees) → Delivery & Operations | Management
12. **Product Manager** (33 employees) → Product & Business | Product Management
13. **Senior Manager** (191 employees) → Delivery & Operations | Management
14. **UI Designer** (139 employees) → Digital Experience | UI Design
15. **UX Designer** (1 employee) → Digital Experience | UX Design
16. **UX Specialist** (46 employees) → Digital Experience | UX Design
17. **Digital Strategist** (18 employees) → Digital Experience | Digital Strategy
18. **Senior Digital Strategist** (16 employees) → Digital Experience | Digital Strategy
19. **Support Analyst** (75 employees) → Technology & Development | Technical Support
20. **Principal Architect** (102 employees) → Technology & Development | Software Architecture
21. **Intern** (313 employees) → Intern Program | Intern Program

### Unmapped Roles Requiring Manual Review

**165 employees (2.4%)** could not be automatically mapped due to:

#### 1. "Not Applicable" Role Base Name (163 employees)
This appears to be a data quality issue where proper role information was not captured.

| Role Group | Employee Count | Percentage |
|-----------|----------------|------------|
| 4 - Senior | 50 | 30.3% |
| 3 - Mid-Level | 40 | 24.2% |
| 6 - Master 2 / Senior Manager | 35 | 21.2% |
| 5 - Master / Manager | 29 | 17.6% |
| 2 - Junior | 9 | 5.5% |

**Sample Logins:** adrian.alves, alanafr, alex.gass, alexandre.porto, alianne, amanda.alves, amanda.moura, amandabg, amelia, ana.guerra

**Recommendation:** These employees need manual role classification. Review their actual work assignments and remap to appropriate career tracks.

#### 2. "No Information" Role Base Name (2 employees)
| Role Group | Employee Count |
|-----------|----------------|
| No Information | 2 |

**Sample Logins:** rebate, [blank]

**Recommendation:** These appear to be placeholder or system entries. Verify if they represent actual employees.

## Distribution Analysis

### By Job Family

| Job Family | Employee Count | Percentage |
|-----------|----------------|------------|
| Technology & Development | 4,976 | 71.0% |
| Delivery & Operations | 779 | 11.1% |
| Data & AI | 439 | 6.3% |
| Intern Program | 313 | 4.5% |
| Digital Experience | 220 | 3.1% |
| Product & Business | 118 | 1.7% |
| ⚠️ UNMAPPED | 165 | 2.4% |

### Top 10 Career Tracks

| Rank | Career Track | Employee Count | Percentage |
|------|-------------|----------------|------------|
| 1 | Software Development | 3,566 | 50.9% |
| 2 | Quality Assurance | 669 | 9.5% |
| 3 | Software Architecture | 666 | 9.5% |
| 4 | Agile/Scrum Leadership | 504 | 7.2% |
| 5 | Intern Program | 313 | 4.5% |
| 6 | Data Development | 276 | 3.9% |
| 7 | Management | 275 | 3.9% |
| 8 | UI Design | 139 | 2.0% |
| 9 | Data Analysis | 118 | 1.7% |
| 10 | Business Analysis | 85 | 1.2% |

### By Seniority Level

| Level | Employee Count | Percentage |
|-------|----------------|------------|
| L4 (Senior) | 2,847 | 40.6% |
| L3 (Mid) | 1,920 | 27.4% |
| L5 (Master/Manager) | 960 | 13.7% |
| L2 (Junior) | 599 | 8.5% |
| L6 (Expert/Senior Manager) | 369 | 5.3% |
| INTERN | 313 | 4.5% |
| Unknown | 2 | 0.0% |

## Output File Structure

### unique-roles-2025-11-normalized.csv

Contains **8 columns** (5 original + 3 normalized):

| Column | Description | Example |
|--------|-------------|---------|
| Login | Employee username | aajordao |
| Role | Original role title | Developer Master |
| Standard Role | Standardized role | Developer - Master |
| Role Base Name | Role category | Developer |
| Role Group | Seniority level | 5 - Master / Manager |
| **normalized_job_family** | **New: Job family** | **Technology & Development** |
| **normalized_career_track** | **New: Career track** | **Software Development** |
| **normalized_role_name** | **New: Normalized role** | **Developer (Master)** |

### unmapped-roles-report.csv

Contains detailed breakdown of the 165 unmapped employees:

| Column | Description |
|--------|-------------|
| Role Base Name | Original role category |
| Role Group | Seniority level |
| Employee Count | Number affected |
| Sample Logins | Example employee usernames |

## Mapping Methodology

### Level Conversion Rules

| Original Role Group | Normalized Level | Suffix |
|---------------------|------------------|--------|
| 1 - Intern | INTERN | Intern |
| 2 - Junior | L2 | (Junior) |
| 3 - Mid-Level | L3 | (Mid) |
| 4 - Senior | L4 | (Senior) |
| 5 - Master / Manager | L5 | (Master) or Manager |
| 6 - Master 2 / Senior Manager | L6 | (Expert) or role-specific |

### Career Track Mapping

Each Role Base Name + Role Group combination was mapped to:
1. **Job Family** - High-level grouping (6 families)
2. **Career Track** - Specific skill progression path (33 tracks)
3. **Normalized Role Name** - Standardized title with level

Example mappings:
- `Developer` + `4 - Senior` → Technology & Development | Software Development | Developer (Senior)
- `Data Analyst` + `5 - Master / Manager` → Data & AI | Data Analysis | Data Analyst (Master)
- `Scrum Master` + `4 - Senior` → Delivery & Operations | Agile/Scrum Leadership | Scrum Master (Senior)

## Recommendations

### Immediate Actions

1. **Review Unmapped Roles (165 employees)**
   - Investigate "Not Applicable" entries to determine actual roles
   - Update source data with correct role information
   - Re-run normalization to achieve 100% mapping

2. **Validate Sample Records**
   - Spot-check normalized mappings for accuracy
   - Verify career track assignments align with actual work
   - Confirm seniority levels are appropriate

3. **Data Quality Improvements**
   - Eliminate "Not Applicable" as a valid role category
   - Implement data validation at source
   - Establish role taxonomy governance

### Next Steps

1. **Integration Planning**
   - Import normalized data into HR systems
   - Update reporting dashboards with new structure
   - Communicate changes to stakeholders

2. **Career Path Implementation**
   - Use normalized structure for career planning
   - Align compensation bands with levels
   - Define progression criteria within tracks

3. **Ongoing Maintenance**
   - Establish process for new role additions
   - Regular audits of role mappings
   - Update normalization rules as org evolves

## Technical Details

### Processing Statistics

- **Input Records:** 7,010 unique employee logins
- **Unique Role Combinations:** 56 distinct (Role Base Name, Role Group) pairs
- **Mapping Rules Created:** 56 automated mappings
- **Processing Time:** < 1 second
- **Data Quality:** 97.6% clean, 2.4% requires manual intervention

### Files Generated

1. **unique-roles-2025-11-normalized.csv** (7,010 rows)
   - Primary output with normalized fields
   - Ready for HR system import
   - All original data preserved

2. **unmapped-roles-report.csv** (6 rows)
   - Detailed unmapped role breakdown
   - Employee counts and samples
   - Guides manual review process

3. **NORMALIZATION-SUMMARY.md** (this file)
   - Comprehensive analysis and documentation
   - Methodology and recommendations
   - Reference for future normalization efforts

## Quality Assurance

### Validation Checks Performed

✅ All employee logins preserved (7,010 in = 7,010 out)  
✅ No duplicate logins created  
✅ Original data fields maintained unchanged  
✅ Unmapped roles clearly marked with "⚠️ UNMAPPED"  
✅ Level conversions applied consistently  
✅ Career track assignments validated against framework  
✅ Job family distributions align with organizational structure  

### Known Limitations

1. **"Not Applicable" entries** - Require manual classification (163 employees)
2. **"No Information" entries** - Need verification (2 employees)
3. **Regional variations** - Not captured in current structure (e.g., -Americas, -EMEA)
4. **Hybrid roles** - Mapped to best-fit single track (may need multi-track support)

## Conclusion

The role normalization process successfully mapped **97.6%** of employees to the new global role directory structure. The remaining **2.4%** require manual review due to data quality issues in the source system.

The normalized structure provides:
- ✅ Clear career progression paths across 33 tracks
- ✅ Consistent job families for organizational reporting
- ✅ Standardized role names for compensation and planning
- ✅ Foundation for talent management and development programs

**Status:** ✅ **Ready for Production Use** (after manual review of 165 unmapped employees)

---

*Generated: November 11, 2025*  
*Normalization Framework: Career Paths Visual (career_paths_visual.md)*  
*Methodology: Automated mapping with manual review fallback*

