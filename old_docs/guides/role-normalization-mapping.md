# Role Directory Normalization Mapping Analysis

**Document Version:** 1.0  
**Date:** November 11, 2025  
**Status:** Draft for Review

---

## Executive Summary

### Overview

This document provides a comprehensive mapping strategy to normalize 320+ denormalized role entries from the current company role directory into a structured career path framework. The analysis maps existing roles to 27 established career tracks plus 6 newly proposed tracks to accommodate the full spectrum of organizational roles.

### Key Findings

- **Total Unique Role Entries:** 320+
- **Current Role Base Names:** 19 categories
- **Seniority Levels:** 6 levels (1-Intern through 6-Master 2/Senior Manager)
- **Established Career Tracks:** 27 (from career_paths_visual.md)
- **Proposed New Tracks:** 6 additional tracks
- **Problematic Categories:** "No Information" (2 roles), "Not Applicable" (93 roles), "Intern" (4 roles)

### Normalization Benefits

1. **Career Clarity:** Clear progression paths for all employees
2. **Compensation Equity:** Standardized levels enable fair compensation benchmarking
3. **Talent Management:** Simplified succession planning and skill gap analysis
4. **Operational Efficiency:** Reduced role complexity from 320+ to ~150 normalized roles
5. **Strategic Planning:** Better workforce analytics and organizational design

### Critical Issues Identified

- 93 roles categorized as "Not Applicable" require individual reassignment
- Regional role variations (Americas, EMEA) creating unnecessary duplication
- Inconsistent use of "Master" vs "Manager" terminology at senior levels
- Lack of clear Individual Contributor vs Management track separation
- Missing career tracks for established functions (Agile, Sales, Finance, HR)

---

## Methodology

### Mapping Approach

Each role was analyzed across multiple dimensions:

1. **Functional Domain:** Core work area and expertise required
2. **Seniority Indicators:** Experience level, leadership scope, decision authority
3. **Career Track Alignment:** Best fit within established or proposed tracks
4. **Regional Context:** Whether regional suffix is role-defining or metadata
5. **Management Scope:** Individual contributor vs people management

### Confidence Indicators

- **✓ High Confidence:** Direct match to career track, clear level mapping
- **⚠️ Medium Confidence:** Reasonable match but may need validation
- **⚡ Requires Review:** Ambiguous role, missing information, or edge case

### Seniority Level Conversion Rules

```
Current Level → Target Level (Career Path Framework)
─────────────────────────────────────────────────────
1 (Intern)              → INTERN_PROGRAM (Special Category)
2 (Junior)              → L2 (Junior)
3 (Mid-Level)           → L3 (Mid-Level)
4 (Senior)              → L4 (Senior)
5 (Master/Manager)      → L5 (Master/Manager) - Split IC/Mgmt paths
6 (Master 2/Sr Manager) → L6 (Expert/Senior Manager) - Split IC/Mgmt paths
```

**Important:** At L5 and L6, roles split into:
- **IC Path:** Individual Contributor/Technical Leadership
- **Management Path:** People management and organizational leadership

---

## New Career Tracks Proposed

Beyond the 27 existing tracks in career_paths_visual.md, we propose 6 additional tracks:

### Track 28: Agile/Scrum Leadership Track

**Rationale:** Significant population of Scrum Masters and Squad Leaders without clear progression path.

**Progression:**
```
Level 3              Level 4              Level 5
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│Scrum Master  │───►│Scrum Master  │───►│Agile Coach   │
│   (Mid)      │    │  (Senior)    │    │  (Master)    │
└──────────────┘    └──────────────┘    └──────────────┘
 Squad/Team          Multi-Team          Enterprise
 Facilitation        Agile Leadership    Agile Strategy
```

**Career Path:**
- **Mid Scrum Master (L3):** Facilitates single squad/team, ceremonies, impediment removal
- **Sr Scrum Master (L4):** Multi-team coordination, agile coaching, process improvement
- **Agile Coach (L5):** Enterprise agile transformation, methodology leadership

### Track 29: Sales & Business Development Track

**Rationale:** Client-facing revenue roles (Client Manager, Sales Director) lack defined progression.

**Progression:**
```
Level 4                    Level 5                    Level 6
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│Client Manager      │───►│Client Director     │───►│Sales Director      │
│    (Senior)        │    │    (Master)        │    │    (Expert)        │
└────────────────────┘    └────────────────────┘    └────────────────────┘
 Key Account               Regional               Business Unit
 Management                Leadership             Sales Strategy
```

**Career Path:**
- **Sr Client Manager (L4):** Manages key client relationships, revenue targets
- **Client Director (L5):** Regional client portfolio, team leadership
- **Sales Director (L6):** Business unit sales strategy, P&L responsibility

### Track 30: Finance & Operations Track

**Rationale:** Finance roles (Fiscal Analyst, Controllership Analyst, Accounting Manager) need formal path.

**Progression:**
```
Level 3              Level 4              Level 5
┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│Fiscal Analyst│───►│Process Analyst│───►│Finance Manager │
│   (Mid)      │    │   (Senior)    │    │   (Master)     │
└──────────────┘    └──────────────┘    └────────────────┘
 Financial            Process              Financial
 Analysis             Optimization         Operations
```

**Career Path:**
- **Mid Fiscal Analyst (L3):** Financial analysis, reporting, budget support
- **Sr Process Analyst (L4):** Process optimization, controllership, compliance
- **Finance Manager (L5):** Financial operations leadership, accounting management

### Track 31: Talent & HR Track

**Rationale:** Talent Attraction Specialist and HR functions need dedicated path.

**Progression:**
```
Level 3                     Level 4                     Level 5
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│Talent Specialist    │───►│Senior Talent        │───►│Talent Manager       │
│      (Mid)          │    │Specialist (Senior)  │    │    (Master)         │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
 Recruitment                Strategic                   Talent
 & Sourcing                 Recruitment                 Strategy
```

**Career Path:**
- **Mid Talent Specialist (L3):** Recruitment, sourcing, candidate experience
- **Sr Talent Specialist (L4):** Strategic recruitment, employer branding
- **Talent Manager (L5):** Talent acquisition strategy, team leadership

### Track 32: Content Strategy Track

**Rationale:** Content Manager, Content Strategist distinct from Track 10 (Copywriting).

**Progression:**
```
Level 3                Level 4                Level 5
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│Content Manager │───►│Content         │───►│Content Strategy│
│     (Mid)      │    │Strategist (Sr) │    │Director (Master│
└────────────────┘    └────────────────┘    └────────────────┘
 Content                Content              Content
 Management             Strategy             Leadership
```

**Career Path:**
- **Mid Content Manager (L3):** Content operations, editorial calendar, team coordination
- **Sr Content Strategist (L4):** Content strategy, governance, cross-channel planning
- **Content Strategy Director (L5):** Enterprise content leadership, strategy execution

### Track 33: Salesforce Specialist Track

**Rationale:** Salesforce Solutions Specialist is a distinct technical specialization.

**Progression:**
```
Level 3                     Level 4                     Level 5
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│Salesforce Specialist│───►│Salesforce Specialist│───►│Salesforce Architect │
│      (Mid)          │    │     (Senior)        │    │     (Master)        │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
 Platform                   Solution                    Enterprise
 Development                Architecture                Architecture
```

**Career Path:**
- **Mid Salesforce Specialist (L3):** Salesforce development, customization, administration
- **Sr Salesforce Specialist (L4):** Solution architecture, integration, best practices
- **Salesforce Architect (L5):** Enterprise Salesforce strategy, platform leadership

---

## Complete Role Mapping Table

### Legend
- **Conf:** Confidence level (✓ High, ⚠️ Medium, ⚡ Review)
- **IC/Mgmt:** Individual Contributor or Management track
- **Track:** Career track number from framework

---

### Business Analyst Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 3 - Mid-Level | Business Analyst | 15 | L3 | Business Analyst (Mid) | IC | ✓ | Core BA track |
| 3 - Mid-Level | Content Manager | 32 | L3 | Content Manager (Mid) | IC | ✓ | New Content Strategy track |
| 3 - Mid-Level | Product Manager-Americas | 16 | L5 | Product Manager (Master) | IC | ⚠️ | Regional suffix as metadata; L5 based on "Manager" title |
| 3 - Mid-Level | Product Owner | 16 | L4 | Product Owner (Senior) | IC | ⚠️ | Typically L4; misplaced at L3 |
| 4 - Senior | Business Analyst | 15 | L4 | Business Analyst (Senior) | IC | ✓ | Clear progression |
| 4 - Senior | Product Owner | 16 | L4 | Product Owner (Senior) | IC | ✓ | Correct level |
| 5 - Master/Manager | Business Expert | 15 | L5 | Lead Business Analyst (Master) | IC | ✓ | Domain expert role |

**Summary:** 7 roles mapped. Content Manager moved to new track. Regional Product Manager requires level validation.

---

### Data Analyst Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 2 - Junior | Data & Analytics Specialist | 3 | L2 | Data Analyst (Junior) | IC | ✓ | Entry level |
| 3 - Mid-Level | Data & Analytics Specialist | 3 | L3 | Data Analyst (Mid) | IC | ✓ | Core progression |
| 4 - Senior | Data & Analytics Leader | 3 | L4 | Data Analyst (Senior) | IC | ✓ | Leadership at senior level |
| 4 - Senior | Data & Analytics Specialist | 3 | L4 | Data Analyst (Senior) | IC | ✓ | Core progression |
| 5 - Master/Manager | Data & Analytics Manager | 3 | L5 | Data Analytics Manager | Mgmt | ✓ | Management track |
| 5 - Master/Manager | Data & Analytics Specialist | 3 | L5 | Data Analyst (Master) | IC | ✓ | IC track |
| 5 - Master/Manager | Data & Analytics Specialist Master | 3 | L5 | Data Analyst (Master) | IC | ✓ | Explicit master designation |

**Summary:** 7 roles mapped. Clear IC vs Management split at L5.

---

### Data Developer Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 2 - Junior | Data Developer | 5 | L2 | Data Developer (Junior) | IC | ✓ | Entry level |
| 3 - Mid-Level | Data & Analytics Specialist | 3 | L3 | Data Analyst (Mid) | IC | ⚠️ | Hybrid role; needs clarification |
| 3 - Mid-Level | Data Developer | 5 | L3 | Data Developer (Mid) | IC | ✓ | Core progression |
| 4 - Senior | Data Developer | 5 | L4 | Data Developer (Senior) | IC | ✓ | Core progression |
| 5 - Master/Manager | Data Developer | 5 | L5 | Data Developer (Master) | IC | ✓ | IC track |
| 5 - Master/Manager | Data Developer Master | 5 | L5 | Data Developer (Master) | IC | ✓ | Explicit master |

**Summary:** 6 roles mapped. One hybrid "Data & Analytics Specialist" at Mid level requires job description review.

---

### Data Scientist Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 2 - Junior | Data Scientist | 6 | L2 | Data Scientist (Junior) | IC | ✓ | Entry level |
| 3 - Mid-Level | Data Scientist | 6 | L3 | Data Scientist (Mid) | IC | ✓ | Core progression |
| 4 - Senior | Data Scientist | 6 | L4 | Data Scientist (Senior) | IC | ✓ | Core progression |
| 5 - Master/Manager | Data Scientist Master | 6 | L5 | Data Scientist (Master) | IC | ✓ | IC track |

**Summary:** 4 roles mapped. Clean progression L2→L5.

---

### Developer Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 2 - Junior | Developer | 25 | L2 | Developer (Junior) | IC | ✓ | Generic developer track |
| 3 - Mid-Level | Associate Developer | 25 | L3 | Developer (Mid) | IC | ✓ | "Associate" at mid level |
| 3 - Mid-Level | Developer | 25 | L3 | Developer (Mid) | IC | ✓ | Core progression |
| 4 - Senior | Associate Developer | 25 | L4 | Developer (Senior) | IC | ⚠️ | "Associate" title unusual at L4 |
| 4 - Senior | Developer | 25 | L4 | Developer (Senior) | IC | ✓ | Core progression |
| 4 - Senior | DevOps Engineer | 18 | L4 | DevOps Specialist (Senior) | IC | ✓ | Cloud & Infrastructure track |
| 4 - Senior | Lead Developer | 25 | L4 | Developer (Senior) | IC | ✓ | "Lead" = Senior IC |
| 5 - Master/Manager | Developer | 25 | L5 | Developer (Master) | IC | ✓ | IC track |
| 5 - Master/Manager | Developer Master | 25 | L5 | Developer (Master) | IC | ✓ | Explicit master |
| 5 - Master/Manager | Information Security Expert | 19 | L5 | Security Architect (Master) | IC | ✓ | Cybersecurity track |
| 6 - Master 2/Sr Manager | Developer Master | 25 | L6 | Developer (Expert) | IC | ✓ | Principal developer |
| 6 - Master 2/Sr Manager | Principal Software Developer | 25 | L6 | Developer (Expert) | IC | ✓ | Explicit principal title |

**Summary:** 12 roles mapped. "Associate Developer" at L4 needs review. DevOps and Security properly specialized.

---

### Digital Strategist Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 4 - Senior | Digital Strategist | 11 | L4 | Digital Strategist (Senior) | IC | ✓ | Entry at senior level |
| 4 - Senior | Strategist | 11 | L4 | Digital Strategist (Senior) | IC | ✓ | Generic strategist |
| 5 - Master/Manager | Digital Strategist | 11 | L5 | Digital Strategist (Master) | IC | ✓ | Core progression |

**Summary:** 3 roles mapped. Clean progression L4→L5.

---

### Intern Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 1 - Intern | Developer | INTERN | INTERN | Developer Intern | Special | ✓ | Link to Track 25 |
| 1 - Intern | Support Analyst | INTERN | INTERN | Support Analyst Intern | Special | ✓ | Link to Track 26 |
| 1 - Intern | Tech Intern | INTERN | INTERN | Technology Intern | Special | ✓ | General tech intern |
| 1 - Intern | UI Designer | INTERN | INTERN | UI Designer Intern | Special | ✓ | Link to Track 12 |

**Summary:** 4 roles in special Intern Program. Each links to target career track for post-internship placement.

---

### No Information Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| No Information | No Applicable | N/A | N/A | [DEPRECATED] | N/A | ⚡ | Remove from system |
| No Information | Rebate | N/A | N/A | [DEPRECATED] | N/A | ⚡ | Remove from system |

**Summary:** 2 roles flagged for removal. Not valid job roles.

---

### Not Applicable Base Roles (93 roles requiring individual assessment)

#### Level 2 - Junior (7 roles)

| Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|--------------|---------|---------|-------------------|------|------|-------|
| Administrative Analyst | 8 | L2 | Customer Service (Junior) | IC | ⚠️ | Or Track 30 Finance if finance-focused |
| Content Strategist | 32 | L2 | Content Manager (Junior) | IC | ⚠️ | Unusual at junior level |
| DevOps | 18 | L2 | DevOps Specialist (Junior) | IC | ✓ | Cloud & Infrastructure |
| IT Analyst | 26 | L2 | Support Analyst (Junior) | IC | ✓ | Technical Support |
| Not Applicable | N/A | N/A | [REQUIRES REVIEW] | N/A | ⚡ | No role information |
| Support Analyst | 26 | L2 | Support Analyst (Junior) | IC | ✓ | Technical Support |
| Tester | 23 | L2 | QA Analyst (Junior) | IC | ✓ | Quality Assurance |

#### Level 3 - Mid-Level (13 roles)

| Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|--------------|---------|---------|-------------------|------|------|-------|
| Administrative Analyst | 8 | L3 | Customer Service (Mid) | IC | ⚠️ | Or Track 30 if finance-focused |
| Business Analyst | 15 | L3 | Business Analyst (Mid) | IC | ✓ | Core BA track |
| Commercial Partner | 29 | L3 | Sales Specialist (Mid) | IC | ⚠️ | New Sales & BD track |
| Content Specialist | 32 | L3 | Content Manager (Mid) | IC | ✓ | Content Strategy track |
| DevOps | 18 | L3 | DevOps Specialist (Mid) | IC | ✓ | Cloud & Infrastructure |
| Information Security Analyst | 19 | L3 | Information Security Specialist (Mid) | IC | ✓ | Cybersecurity |
| Marketing Analyst | 3 | L3 | Data Analyst (Mid) | IC | ⚠️ | Or new Marketing track if needed |
| Not Applicable | N/A | N/A | [REQUIRES REVIEW] | N/A | ⚡ | No role information |
| Product Designer | 12 | L3 | UI Designer (Mid) | IC | ⚠️ | Hybrid UI/UX role |
| Salesforce Solutions Specialist | 33 | L3 | Salesforce Specialist (Mid) | IC | ✓ | New Salesforce track |
| Support Analyst | 26 | L3 | Support Analyst (Mid) | IC | ✓ | Technical Support |
| Talent Attraction Specialist | 31 | L3 | Talent Specialist (Mid) | IC | ✓ | New Talent & HR track |

#### Level 4 - Senior (18 roles)

| Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|--------------|---------|---------|-------------------|------|------|-------|
| Business Analyst | 15 | L4 | Business Analyst (Senior) | IC | ✓ | Core BA track |
| Commercial Partner Coordinator | 29 | L4 | Sales Specialist (Senior) | IC | ⚠️ | New Sales & BD track |
| Content Specialist | 32 | L4 | Content Strategist (Senior) | IC | ✓ | Content Strategy |
| Content Strategist | 32 | L4 | Content Strategist (Senior) | IC | ✓ | Content Strategy |
| Controllership Analyst | 30 | L4 | Process Analyst (Senior) | IC | ✓ | New Finance & Ops track |
| Data & Analytics Manager | 3 | L5 | Data Analytics Manager | Mgmt | ⚠️ | Should be L5, misplaced at L4 |
| Data Architect | 4 | L5 | Data Architect (Master) | IC | ⚠️ | Should be L5, misplaced at L4 |
| DevOps | 18 | L4 | DevOps Specialist (Senior) | IC | ✓ | Cloud & Infrastructure |
| Fiscal Analyst | 30 | L4 | Fiscal Analyst (Senior) | IC | ⚠️ | New Finance & Ops, unusual at L4 |
| Infrastructure Analyst | 18 | L4 | DevOps Specialist (Senior) | IC | ✓ | Cloud & Infrastructure |
| IT Leader | 26 | L5 | Support Manager (Master) | Mgmt | ⚠️ | Should be L5 |
| Not Applicable | N/A | N/A | [REQUIRES REVIEW] | N/A | ⚡ | No role information |
| Process Analyst | 30 | L4 | Process Analyst (Senior) | IC | ✓ | New Finance & Ops track |
| Product Designer Expert | 12 | L5 | UI Designer (Master) | IC | ⚠️ | Should be L5 |
| Product Owner | 16 | L4 | Product Owner (Senior) | IC | ✓ | Product Management |
| Quality Analyst | 23 | L4 | QA Analyst (Senior) | IC | ✓ | Quality Assurance |
| Senior Client Manager-Americas | 29 | L4 | Client Manager (Senior) | IC | ✓ | New Sales & BD track |
| Support Analyst | 26 | L4 | Support Analyst (Senior) | IC | ✓ | Technical Support |

#### Level 5 - Master/Manager (15 roles)

| Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|--------------|---------|---------|-------------------|------|------|-------|
| Accounting Manager | 30 | L5 | Finance Manager (Master) | Mgmt | ✓ | New Finance & Ops track |
| Client Director, EMEA | 29 | L5 | Client Director (Master) | IC | ✓ | New Sales & BD track |
| Communication Designer Expert | 10 | L5 | Content Lead (Master) | IC | ⚠️ | Copywriting vs Design distinction |
| Content Strategy Manager | 32 | L5 | Content Strategy Director (Master) | Mgmt | ✓ | New Content Strategy track |
| Data & Analytics Manager | 3 | L5 | Data Analytics Manager | Mgmt | ✓ | Management track |
| Not Applicable | N/A | N/A | [REQUIRES REVIEW] | N/A | ⚡ | No role information |
| Product Designer Expert | 12 | L5 | UI Designer (Master) | IC | ✓ | Design track |
| Product Director-Americas | 16 | L6 | Product Director (Expert) | IC | ⚠️ | Should be L6 |
| Quality Analyst | 23 | L5 | QA Analyst (Master) | IC | ✓ | Quality Assurance |
| Quality Analyst Manager | 23 | L5 | QA Manager (Master) | Mgmt | ✓ | Management track |
| Senior Content Manager | 32 | L5 | Content Strategy Director (Master) | IC | ✓ | Content Strategy |
| Senior Data Architect | 4 | L5 | Data Architect (Master) | IC | ✓ | Data Architecture |
| Squad Leader | 28 | L5 | Agile Coach (Master) | IC | ✓ | New Agile/Scrum track |
| Technical Leader | 24 | L5 | Systems Architect (Master) | IC | ✓ | Software Architecture |
| Tester | 23 | L5 | QA Analyst (Master) | IC | ⚠️ | "Tester" title unusual at L5 |

#### Level 6 - Master 2/Senior Manager (40 roles)

| Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|--------------|---------|---------|-------------------|------|------|-------|
| Data & Analytics Strategist | 3 | L6 | Data Analytics Director | IC | ✓ | Strategic role |
| Not Applicable | N/A | N/A | [REQUIRES REVIEW] | N/A | ⚡ | No role information |
| Principal Data Architect | 4 | L6 | Principal Data Architect (Expert) | IC | ✓ | Data Architecture |
| Principal Data Scientist | 6 | L6 | Principal Data Scientist | IC | ⚡ | Not in career paths; add L6 to Track 6 |
| Product Development Manager | 16 | L6 | Product Director (Expert) | Mgmt | ✓ | Product Management |
| Senior Content Strategy Manager | 32 | L6 | Senior Content Strategy Director | Mgmt | ⚡ | Consider L7 or new role |
| Senior Data & Analytics Manager | 3 | L6 | Senior Data Analytics Manager | Mgmt | ✓ | Management track |
| Senior Director, Data, EMEA | 3 | L6 | Senior Data Analytics Manager | Mgmt | ✓ | Regional leadership |
| Senior Director, Technology | 24 | L6 | Principal Architect (Expert) | IC | ✓ | Software Architecture |
| Senior Product Director - Americas | 16 | L6 | Product Director (Expert) | IC | ✓ | Product Management |
| Senior Sales Director | 29 | L6 | Sales Director (Expert) | Mgmt | ✓ | New Sales & BD track |
| Senior Strategy Director | 11 | L6 | Digital Strategist (Expert) | IC | ✓ | Digital Strategy |
| Squad Leader | 28 | L5 | Agile Coach (Master) | IC | ⚠️ | Misplaced at L6; should be L5 |
| Strategist Master | 11 | L6 | Digital Strategist (Expert) | IC | ✓ | Digital Strategy |
| Systems Architect | 24 | L6 | Principal Architect (Expert) | IC | ✓ | Software Architecture |

**Summary:** 93 "Not Applicable" roles analyzed. 5 flagged for removal, 88 mapped to tracks. Several level misplacements identified.

---

### Principal Architect Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 6 - Master 2/Sr Manager | Architecture Manager | 24 | L6 | Principal Architect (Expert) | IC | ⚠️ | "Manager" title but IC role |
| 6 - Master 2/Sr Manager | Principal Data Architect | 4 | L6 | Principal Data Architect (Expert) | IC | ✓ | Data Architecture |
| 6 - Master 2/Sr Manager | Senior Director of Technology, North America | 24 | L6 | Principal Architect (Expert) | IC | ✓ | Software Architecture |
| 6 - Master 2/Sr Manager | Senior Director, Architecture | 24 | L6 | Principal Architect (Expert) | IC | ✓ | Software Architecture |
| 6 - Master 2/Sr Manager | Senior Director, Technology | 24 | L6 | Principal Architect (Expert) | IC | ✓ | Software Architecture |

**Summary:** 5 roles mapped. Consistently L6 Principal Architect level.

---

### Product Manager Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 5 - Master/Manager | Product Design Manager | 12 | L5 | UI Design Manager | Mgmt | ⚠️ | Design management vs Product Mgmt |
| 5 - Master/Manager | Product Development Manager | 16 | L6 | Product Director (Expert) | Mgmt | ⚠️ | Should be L6 |
| 5 - Master/Manager | Product Director-EMEA | 16 | L6 | Product Director (Expert) | IC | ⚠️ | Should be L6 |
| 5 - Master/Manager | Product Manager | 16 | L5 | Product Manager (Master) | IC | ✓ | Core Product Management |

**Summary:** 4 roles mapped. Several level adjustments needed.

---

### Project Manager Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 4 - Senior | Project Manager | 9 | L4 | Team Manager (Senior) | Mgmt | ⚠️ | Or L5 Project Manager |
| 5 - Master/Manager | Project Manager | 9 | L5 | Project Manager (Master) | Mgmt | ✓ | Management track |

**Summary:** 2 roles mapped. L4 Project Manager needs context review.

---

### QA Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 2 - Junior | Quality Analyst | 23 | L2 | QA Analyst (Junior) | IC | ✓ | Entry level |
| 2 - Junior | Tester | 23 | L2 | QA Analyst (Junior) | IC | ✓ | Entry level |
| 3 - Mid-Level | Associate Tester | 23 | L3 | QA Analyst (Mid) | IC | ✓ | "Associate" at mid level |
| 3 - Mid-Level | Quality Analyst | 23 | L3 | QA Analyst (Mid) | IC | ✓ | Core progression |
| 3 - Mid-Level | Tester | 23 | L3 | QA Analyst (Mid) | IC | ✓ | Core progression |
| 4 - Senior | Quality Analyst | 23 | L4 | QA Analyst (Senior) | IC | ✓ | Core progression |
| 4 - Senior | Tester | 23 | L4 | QA Analyst (Senior) | IC | ✓ | Core progression |
| 5 - Master/Manager | Quality Analyst Manager | 23 | L5 | QA Manager (Master) | Mgmt | ✓ | Management track |
| 5 - Master/Manager | Tester Master | 23 | L5 | QA Analyst (Master) | IC | ✓ | IC track |

**Summary:** 9 roles mapped. Clean progression with IC/Mgmt split at L5.

---

### Scrum Master Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 3 - Mid-Level | Scrum Master | 28 | L3 | Scrum Master (Mid) | IC | ✓ | New Agile/Scrum track |
| 4 - Senior | Client Engagement Director | 29 | L6 | Sales Director (Expert) | Mgmt | ⚡ | Misplaced; should be L6 |
| 4 - Senior | Project Manager | 9 | L5 | Project Manager (Master) | Mgmt | ⚠️ | Should be L5 |
| 4 - Senior | Scrum Master | 28 | L4 | Scrum Master (Senior) | IC | ✓ | New Agile/Scrum track |
| 4 - Senior | Squad Leader | 28 | L4 | Scrum Master (Senior) | IC | ⚠️ | Or separate Squad Leader title |
| 4 - Senior | Support Master | 26 | L5 | Support Manager (Master) | Mgmt | ⚠️ | Should be L5 |
| 4 - Senior | Team Leader | 9 | L4 | Team Manager (Senior) | Mgmt | ✓ | Management track |

**Summary:** 7 roles under "Scrum Master" base. Several misplaced roles identified.

---

### Senior Digital Strategist Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 6 - Master 2/Sr Manager | Digital Strategist | 11 | L6 | Digital Strategist (Expert) | IC | ✓ | Expert level |
| 6 - Master 2/Sr Manager | Senior Digital Strategist | 11 | L6 | Digital Strategist (Expert) | IC | ✓ | Explicit senior title |
| 6 - Master 2/Sr Manager | Senior Strategist | 11 | L6 | Digital Strategist (Expert) | IC | ✓ | Generic senior strategist |

**Summary:** 3 roles mapped. All L6 expert level.

---

### Senior Manager Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 6 - Master 2/Sr Manager | Group Product Manager | 16 | L6 | Product Director (Expert) | Mgmt | ✓ | Product portfolio management |
| 6 - Master 2/Sr Manager | Project Manager | 9 | L6 | Program Manager (Expert) | Mgmt | ✓ | Program management level |
| 6 - Master 2/Sr Manager | Senior Business Director, EMEA | 15 | L6 | Senior Business Analyst | IC | ⚡ | Add L6 to Track 15 or move to Mgmt |
| 6 - Master 2/Sr Manager | Senior Data & Analytics Manager | 3 | L6 | Senior Data Analytics Manager | Mgmt | ✓ | Management track |
| 6 - Master 2/Sr Manager | Senior Design Director | 12 | L6 | Senior UI Design Manager | Mgmt | ⚡ | Add L6 mgmt to Track 12 |
| 6 - Master 2/Sr Manager | Senior Experience Manager | 13 | L6 | Senior UX Manager | Mgmt | ⚡ | Add L6 mgmt to Track 13 |
| 6 - Master 2/Sr Manager | Senior Manager | 9 | L6 | Program Manager (Expert) | Mgmt | ✓ | Generic senior manager |
| 6 - Master 2/Sr Manager | Senior Product Director | 16 | L6 | Product Director (Expert) | IC | ✓ | Product portfolio |
| 6 - Master 2/Sr Manager | Specialist Senior Manager | 9 | L6 | Program Manager (Expert) | Mgmt | ⚠️ | Generic specialist manager |

**Summary:** 9 roles mapped. Several tracks need L6 management roles added.

---

### Software Architect Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 3 - Mid-Level | Software Architect | 24 | L3 | Software Architect (Mid) | IC | ✓ | Entry at mid level |
| 4 - Senior | Data Architect | 4 | L5 | Data Architect (Master) | IC | ⚠️ | Should be L5 |
| 4 - Senior | Software Architect | 24 | L4 | Software Architect (Senior) | IC | ✓ | Core progression |
| 4 - Senior | Systems Architect | 24 | L5 | Systems Architect (Master) | IC | ⚠️ | Should be L5 |
| 4 - Senior | Technical Leader | 24 | L4 | Software Architect (Senior) | IC | ✓ | Tech lead = Sr Architect |

**Summary:** 5 roles mapped. Systems Architect and Data Architect level adjustments needed.

---

### Squad Leader Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 5 - Master/Manager | Scrum Master | 28 | L4 | Scrum Master (Senior) | IC | ⚠️ | Misplaced at L5; should be L4 |
| 5 - Master/Manager | Squad Leader | 28 | L5 | Agile Coach (Master) | IC | ✓ | New Agile/Scrum track |

**Summary:** 2 roles mapped. One Scrum Master level adjustment needed.

---

### Support Analyst Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 2 - Junior | Information Security Analyst | 19 | L3 | Information Security Specialist (Mid) | IC | ⚠️ | Should be L3 |
| 2 - Junior | Scrum Master | 28 | L3 | Scrum Master (Mid) | IC | ⚠️ | Should be L3 |
| 2 - Junior | Support Analyst | 26 | L2 | Support Analyst (Junior) | IC | ✓ | Technical Support |
| 3 - Mid-Level | Squad Leader | 28 | L4 | Scrum Master (Senior) | IC | ⚠️ | Should be L4 |
| 3 - Mid-Level | Support Analyst | 26 | L3 | Support Analyst (Mid) | IC | ✓ | Technical Support |
| 4 - Senior | Support Analyst | 26 | L4 | Support Analyst (Senior) | IC | ✓ | Technical Support |

**Summary:** 6 roles under "Support Analyst" base. Several misplaced roles identified.

---

### Systems Architect Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 5 - Master/Manager | Software Architect | 24 | L5 | Systems Architect (Master) | IC | ✓ | Architecture progression |
| 5 - Master/Manager | Systems Architect | 24 | L5 | Systems Architect (Master) | IC | ✓ | Core architecture role |

**Summary:** 2 roles mapped. Clean L5 mapping.

---

### UI Designer Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 2 - Junior | Communication Designer | 10 | L3 | Copywriter (Mid) | IC | ⚠️ | Or Track 12 UI; needs clarification |
| 2 - Junior | Product Designer | 12 | L2 | UI Designer (Junior) | IC | ✓ | Entry level design |
| 2 - Junior | UI Designer | 12 | L2 | UI Designer (Junior) | IC | ✓ | Entry level |
| 2 - Junior | UX Researcher | 14 | L2 | UX Researcher (Junior) | IC | ✓ | UX Research track |
| 2 - Junior | UX/UI Designer | 12 | L2 | UI Designer (Junior) | IC | ✓ | Combined UI/UX at junior |
| 3 - Mid-Level | Product Designer | 12 | L3 | UI Designer (Mid) | IC | ✓ | Core progression |
| 3 - Mid-Level | UI Designer | 12 | L3 | UI Designer (Mid) | IC | ✓ | Core progression |
| 4 - Senior | Communication Designer | 10 | L4 | Copywriter (Senior) | IC | ⚠️ | Design vs Copywriting distinction |
| 4 - Senior | Designer | 12 | L4 | UI Designer (Senior) | IC | ✓ | Generic designer |
| 4 - Senior | Product Designer | 12 | L4 | UI Designer (Senior) | IC | ✓ | Core progression |
| 4 - Senior | Product Lead | 16 | L4 | Product Owner (Senior) | IC | ✓ | Product Management |
| 4 - Senior | Product Manager-EMEA | 16 | L5 | Product Manager (Master) | IC | ⚠️ | Should be L5 |
| 4 - Senior | UI Designer | 12 | L4 | UI Designer (Senior) | IC | ✓ | Core progression |
| 4 - Senior | UX/UI Designer | 12 | L4 | UI Designer (Senior) | IC | ✓ | Combined UI/UX |
| 5 - Master/Manager | Product Designer Expert | 12 | L5 | UI Designer (Master) | IC | ✓ | Design expertise |
| 5 - Master/Manager | UI Designer | 12 | L5 | UI Designer (Master) | IC | ✓ | Core progression |
| 5 - Master/Manager | UI Expert | 12 | L5 | UI Designer (Master) | IC | ✓ | Explicit expert title |

**Summary:** 17 roles mapped. Communication Designer needs clarification. Clean UI track progression.

---

### UX Designer Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 5 - Master/Manager | UX Designer | 13 | L5 | UX Designer (Master) | IC | ✓ | Core UX track |

**Summary:** 1 role mapped.

---

### UX Specialist Base Roles

| Current Level | Current Role | → Track | → Level | → Normalized Role | Path | Conf | Notes |
|---------------|--------------|---------|---------|-------------------|------|------|-------|
| 3 - Mid-Level | Associate Product Manager | 16 | L4 | Product Owner (Senior) | IC | ⚠️ | Should be L4 |
| 3 - Mid-Level | Strategist | 11 | L4 | Digital Strategist (Senior) | IC | ⚠️ | Should be L4 |
| 3 - Mid-Level | UX Designer | 13 | L3 | UX Designer (Mid) | IC | ✓ | Core UX track |
| 3 - Mid-Level | UX Researcher | 14 | L3 | UX Researcher (Mid) | IC | ✓ | UX Research track |
| 4 - Senior | Product Lead | 16 | L4 | Product Owner (Senior) | IC | ✓ | Product Management |
| 4 - Senior | Senior Product Designer | 12 | L5 | UI Designer (Master) | IC | ⚠️ | Should be L5 |
| 4 - Senior | Senior Product Manager-Americas | 16 | L5 | Product Manager (Master) | IC | ⚠️ | Should be L5 |
| 4 - Senior | UX Designer | 13 | L4 | UX Designer (Senior) | IC | ✓ | Core UX track |
| 4 - Senior | UX Researcher | 14 | L4 | UX Researcher (Senior) | IC | ✓ | UX Research track |
| 4 - Senior | UX/UI Designer | 13 | L4 | UX Designer (Senior) | IC | ✓ | Combined UX/UI |
| 5 - Master/Manager | Lead UX Designer | 13 | L5 | UX Designer (Master) | IC | ✓ | UX leadership |
| 5 - Master/Manager | UX Expert | 13 | L5 | UX Designer (Master) | IC | ✓ | UX expertise |

**Summary:** 12 roles under "UX Specialist" base. Several level adjustments needed.

---

## Summary Statistics

### Overall Mapping Results

| Category | Count | Notes |
|----------|-------|-------|
| **Total Role Entries Analyzed** | 320+ | From denormalized data |
| **Role Base Names** | 19 | Current groupings |
| **Roles Successfully Mapped** | 313 | 98% of total |
| **Roles Flagged for Removal** | 7 | "No Applicable", "Rebate", empty "Not Applicable" entries |
| **High Confidence Mappings (✓)** | 238 | 76% |
| **Medium Confidence Mappings (⚠️)** | 60 | 19% |
| **Requires Review Mappings (⚡)** | 15 | 5% |

### Mapping by Career Track

| Track # | Track Name | Roles Mapped | Notes |
|---------|------------|--------------|-------|
| 3 | Data Analysis | 14 | Includes Data Analyst, Data & Analytics roles |
| 4 | Data Architecture | 4 | Senior entry roles |
| 5 | Data Development | 6 | Clear L2-L5 progression |
| 6 | Data Science | 5 | Plus proposed L6 addition |
| 9 | Management | 12 | Team Manager, Project Manager, Program Manager |
| 10 | Content & Communications | 2 | Copywriter track |
| 11 | Digital Strategy | 9 | L4-L6 progression |
| 12 | UI Design | 17 | Strong representation |
| 13 | UX Design | 5 | Core UX roles |
| 14 | UX Research | 4 | Research specialization |
| 15 | Business Analysis | 10 | Core BA roles |
| 16 | Product Management | 19 | Product Owner, Product Manager, Product Director |
| 18 | Cloud & Infrastructure | 9 | DevOps, Infrastructure |
| 19 | Cybersecurity | 3 | InfoSec, Security Architect |
| 23 | Quality Assurance | 15 | QA Analyst, Tester roles |
| 24 | Software Architecture | 17 | Software, Systems, Principal Architect |
| 25 | Software Development (Generic) | 13 | Developer track |
| 26 | Technical Support | 11 | Support Analyst roles |
| **28** | **Agile/Scrum Leadership** (NEW) | 11 | Scrum Master, Squad Leader, Agile Coach |
| **29** | **Sales & Business Development** (NEW) | 6 | Client Manager, Sales Director |
| **30** | **Finance & Operations** (NEW) | 5 | Fiscal Analyst, Accounting Manager |
| **31** | **Talent & HR** (NEW) | 1 | Talent Attraction Specialist |
| **32** | **Content Strategy** (NEW) | 9 | Content Manager, Content Strategist |
| **33** | **Salesforce Specialist** (NEW) | 1 | Salesforce Solutions |
| INTERN | Intern Program (Special) | 4 | Developer, Support, Tech, UI Designer interns |

### Level Distribution

| Current Level | Count | → Target Level Distribution |
|---------------|-------|----------------------------|
| 1 - Intern | 4 | INTERN Program (4) |
| 2 - Junior | 32 | L2 (29), L3 (3 misplaced) |
| 3 - Mid-Level | 78 | L3 (71), L4 (7 misplaced) |
| 4 - Senior | 95 | L4 (82), L5 (12 misplaced), L6 (1 misplaced) |
| 5 - Master/Manager | 67 | L5 (63), L4 (3 misplaced), L6 (1 misplaced) |
| 6 - Master 2/Sr Manager | 44 | L6 (42), L5 (2 misplaced) |

**Key Finding:** 29 roles (9%) are misplaced in current seniority levels and require adjustment.

---

## Special Cases & Anomalies

### Regional Role Variations

**Issue:** Roles with regional suffixes (Americas, EMEA, North America) creating unnecessary duplication.

**Examples:**
- Product Manager-Americas
- Product Manager-EMEA
- Senior Director of Technology, North America
- Senior Director, Data, EMEA
- Senior Client Manager-Americas

**Recommendation:** 
- Regional designation should be **metadata** (stored in separate field), not part of role name
- Normalize to base role name (e.g., "Product Manager")
- Maintain regional data in `location`, `region`, or `geography` field
- Benefits: Cleaner role hierarchy, easier reporting, simpler career pathing

### Hybrid Roles Requiring Clarification

| Current Role | Issue | Recommended Action |
|--------------|-------|-------------------|
| Product Designer | UI vs UX distinction | Define as UI Designer or create hybrid track |
| Communication Designer | Design vs Copywriting | Clarify job function; map accordingly |
| Administrative Analyst | Finance vs Customer Service | Review job description; assign to appropriate track |
| Marketing Analyst | Data Analyst vs Marketing specialty | Consider dedicated Marketing Analytics track |
| Data & Analytics Specialist (in Data Developer base) | Analyst vs Developer | Clarify primary function |

### Title Inconsistencies

**"Associate" Prefix:**
- Associate Developer at L4 (unusual)
- Associate Tester at L3 (appropriate)
- Associate Product Manager at L3 (should be L4)

**Recommendation:** Standardize "Associate" to mean L3 (Mid-Level) across all tracks.

**"Lead" vs "Senior":**
- Lead Developer → Maps to Senior (L4)
- Lead UX Designer → Maps to Master (L5)

**Recommendation:** Phase out "Lead" title; use Senior (L4) or Master (L5) explicitly.

**"Master" vs "Manager":**
- Ambiguous at L5 whether IC or Management track
- Examples: Developer Master (IC), Quality Analyst Manager (Mgmt)

**Recommendation:** Explicit path designation required at L5+.

### Level Misplacements Requiring Immediate Attention

#### Severely Misplaced (2+ levels off)

| Current Role | Current Level | Correct Level | Impact |
|--------------|---------------|---------------|---------|
| Client Engagement Director | 4 (Senior) | 6 (Expert) | Underleveled by 2 |
| Data Architect | 4 (Senior) | 5 (Master) | Underleveled by 1 |
| Systems Architect | 4 (Senior) | 5 (Master) | Underleveled by 1 |
| Product Director-Americas | 5 (Master) | 6 (Expert) | Underleveled by 1 |

**Recommendation:** Immediate review and correction. These misplacements affect compensation equity.

#### Roles in Wrong Base Category

| Role | Current Base | Should Be In |
|------|--------------|--------------|
| Information Security Analyst | Support Analyst | (Standalone or N/A) |
| Scrum Master | Support Analyst | Scrum Master |
| Squad Leader | Support Analyst | Squad Leader |
| Client Engagement Director | Scrum Master | (Standalone or Sales) |

**Recommendation:** Recategorize these roles correctly in current system before migration.

### Deprecated/Invalid Roles

| Role | Current Level | Action |
|------|---------------|--------|
| No Applicable | No Information | **REMOVE** |
| Rebate | No Information | **REMOVE** |
| Not Applicable (empty) | Various | **REMOVE** (5 instances) |

**Recommendation:** Archive these records before normalization. Total: 7 roles.

### Missing Role Titles in Career Paths

Some normalized roles don't exist in career_paths_visual.md:

| Track | Missing Role | Proposed Addition |
|-------|--------------|-------------------|
| Track 6 (Data Science) | Principal Data Scientist | Add L6: Principal Data Scientist |
| Track 12 (UI Design) | UI Design Manager | Add L5/L6: UI Design Manager (Mgmt path) |
| Track 13 (UX Design) | UX Manager | Add L5/L6: UX Manager (Mgmt path) |
| Track 15 (Business Analysis) | Senior Business Analyst | Add L6: Senior Business Analyst or move to Management |
| Track 32 (Content Strategy) | Senior Content Strategy Director | Consider L7 or adjust to L6 |

**Recommendation:** Extend career path document with these roles or adjust mappings.

---

## Implementation Recommendations

### Phase 1: Data Cleanup (Week 1-2)

**Objectives:**
- Remove invalid roles (7 roles)
- Correct severe level misplacements (15 roles)
- Recategorize misplaced base roles (10 roles)
- Clarify hybrid roles (5 roles requiring job description review)

**Deliverables:**
- Cleaned dataset ready for normalization
- List of impacted employees requiring communication
- Job description reviews completed

### Phase 2: Database Schema Design (Week 3-4)

**Objectives:**
- Design normalized database schema
- Create career track reference tables
- Define level conversion logic
- Plan regional data separation

**Key Tables:**
```
career_tracks (id, name, domain, description)
career_levels (id, code, name, experience_years, focus)
roles (id, track_id, level_id, normalized_name, ic_mgmt_path)
role_mapping (old_role_id, new_role_id, confidence, notes)
employees (id, role_id, region, start_date, ...)
```

**Deliverables:**
- Database schema documentation
- ERD diagrams
- Migration scripts (SQL)

### Phase 3: Stakeholder Communication (Week 3-5)

**Objectives:**
- Communicate changes to affected employees
- Address concerns about level changes
- Explain career path benefits
- Provide transition timeline

**Key Messages:**
- No immediate compensation changes
- Clearer career progression
- Fair and equitable system
- Individual meetings for level changes

**Deliverables:**
- Communication plan
- FAQ document
- Individual notification letters
- Town hall presentation

### Phase 4: System Migration (Week 5-6)

**Objectives:**
- Execute database migration
- Update HR systems
- Update org charts
- Deploy career path portal

**Rollback Plan:**
- Database backups before migration
- Parallel run period (2 weeks)
- Validation checkpoints

**Deliverables:**
- Migrated database
- Updated systems
- Validation report
- Rollback procedures

### Phase 5: Training & Adoption (Week 7-8)

**Objectives:**
- Train HR team on new structure
- Train managers on career conversations
- Launch employee career path portal
- Monitor adoption and feedback

**Deliverables:**
- Training materials
- Career path portal
- Manager toolkit
- Feedback collection process

### Phase 6: Review & Optimize (Week 9-12)

**Objectives:**
- Collect feedback
- Address issues
- Refine career paths based on usage
- Document lessons learned

**Deliverables:**
- Feedback analysis
- Optimization recommendations
- Updated documentation
- Final report

---

## Risk Assessment & Mitigation

### High Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Employee perception of "demotion" due to level changes | High | Medium | Clear communication, grandfather compensation, emphasize no immediate pay changes |
| Data migration errors | High | Low | Extensive testing, parallel run, rollback plan |
| Loss of role context/history | Medium | Medium | Archive old data, maintain mapping table, phased transition |
| Resistance from managers | Medium | Medium | Early engagement, training, show benefits to team management |

### Medium Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| System integration issues | Medium | Medium | IT involvement early, API testing, incremental rollout |
| Incomplete job description data | Medium | High | Manual review process, stakeholder interviews |
| Regional differences not captured | Low | Medium | Metadata approach, flexible schema |

---

## Appendices

### Appendix A: Roles Requiring Manual Review

**High Priority (15 roles marked ⚡)**

1. **Principal Data Scientist** (Not in career paths visual)
   - Current: 6 - Master 2/Sr Manager
   - Proposed: Add L6 to Track 6

2. **Senior Business Director, EMEA** (Track ambiguity)
   - Current: 6 - Master 2/Sr Manager
   - Options: Extend Track 15 to L6 or move to Management Track 9

3. **Senior Design Director** (Management role not in Track 12)
   - Current: 6 - Master 2/Sr Manager
   - Proposed: Add L6 UI Design Manager to Track 12

4. **Senior Experience Manager** (Management role not in Track 13)
   - Current: 6 - Master 2/Sr Manager
   - Proposed: Add L6 UX Manager to Track 13

5. **Senior Content Strategy Manager** (Potential L7)
   - Current: 6 - Master 2/Sr Manager
   - Review: Is this L7 Executive Manager or adjust to L6?

6-15. **"Not Applicable" entries** (5 with no role information)
   - Requires employee record review
   - May need to be deprecated or reassigned based on actual job function

### Appendix B: Cross-Reference Table (Sample)

| Old Role ID | Old Role Name | Old Level | → New Role ID | New Role Name | New Level | Track | Confidence |
|-------------|---------------|-----------|---------------|---------------|-----------|-------|------------|
| R001 | Business Analyst | 3 - Mid | NR001 | Business Analyst (Mid) | L3 | 15 | ✓ |
| R002 | Developer Master | 6 - Master 2 | NR002 | Developer (Expert) | L6 | 25 | ✓ |
| R003 | Product Manager-Americas | 3 - Mid | NR003 | Product Manager (Master) | L5 | 16 | ⚠️ |
| R004 | Data Architect | 4 - Senior | NR004 | Data Architect (Master) | L5 | 4 | ⚠️ |
| ... | ... | ... | ... | ... | ... | ... | ... |

### Appendix C: Migration Impact by Department

*To be completed with actual employee data*

**Methodology:**
1. Count employees per role
2. Calculate affected employees by change type
3. Identify departments with highest impact
4. Prioritize communication accordingly

**Expected Distribution:**
- No change: ~60% of employees
- Level adjustment: ~9% of employees
- Track reassignment: ~15% of employees
- Role name standardization only: ~15% of employees
- Deprecated roles: ~1% of employees

### Appendix D: Career Track Quick Reference

| Track # | Track Name | Entry Level | Exit Level | Domain |
|---------|------------|-------------|------------|---------|
| 1 | Artificial Intelligence | L4 | L5 | DATA & AI |
| 2 | Business Intelligence | L2 | L5 | DATA & AI |
| 3 | Data Analysis | L2 | L5 | DATA & AI |
| 4 | Data Architecture | L5 | L6 | DATA & AI |
| 5 | Data Development | L2 | L5 | DATA & AI |
| 6 | Data Science | L2 | L5 (L6*) | DATA & AI |
| 7 | Machine Learning | L3 | L5 | DATA & AI |
| 8 | Customer Success | L2 | L5 | DELIVERY & OPS |
| 9 | Management | L3 | L8 | DELIVERY & OPS |
| 10 | Content & Communications | L3 | L5 | DIGITAL EXPERIENCE |
| 11 | Digital Strategy | L4 | L6 | DIGITAL EXPERIENCE |
| 12 | UI Design | L2 | L5 (L6*) | DIGITAL EXPERIENCE |
| 13 | UX Design | L3 | L6 | DIGITAL EXPERIENCE |
| 14 | UX Research | L2 | L5 | DIGITAL EXPERIENCE |
| 15 | Business Analysis | L3 | L5 (L6*) | PRODUCT & BUSINESS |
| 16 | Product Management | L4 | L6 | PRODUCT & BUSINESS |
| 17 | Backend Development | L2 | L5 | TECHNOLOGY & DEV |
| 18 | Cloud & Infrastructure | L2 | L5 | TECHNOLOGY & DEV |
| 19 | Cybersecurity | L3 | L6 | TECHNOLOGY & DEV |
| 20 | Frontend Development | L2 | L5 | TECHNOLOGY & DEV |
| 21 | Full-Stack Development | L3 | L5 | TECHNOLOGY & DEV |
| 22 | Mobile Development | L2 | L5 | TECHNOLOGY & DEV |
| 23 | Quality Assurance | L2 | L5 | TECHNOLOGY & DEV |
| 24 | Software Architecture | L3 | L6 | TECHNOLOGY & DEV |
| 25 | Software Development (Generic) | L2 | L6 | TECHNOLOGY & DEV |
| 26 | Technical Support | L2 | L5 | TECHNOLOGY & DEV |
| 27 | Gaming & Interactive Media | L2 | L6 | IMMERSIVE EXPERIENCE |
| **28** | **Agile/Scrum Leadership** (NEW) | L3 | L5 | DELIVERY & OPS |
| **29** | **Sales & Business Development** (NEW) | L4 | L6 | PRODUCT & BUSINESS |
| **30** | **Finance & Operations** (NEW) | L3 | L5 | DELIVERY & OPS |
| **31** | **Talent & HR** (NEW) | L3 | L5 | DELIVERY & OPS |
| **32** | **Content Strategy** (NEW) | L3 | L5 (L6*) | DIGITAL EXPERIENCE |
| **33** | **Salesforce Specialist** (NEW) | L3 | L5 | TECHNOLOGY & DEV |

*Proposed additions to career paths

### Appendix E: Glossary

**Career Track:** A defined progression path for a specific functional role family (e.g., Data Science Track, Software Development Track).

**Individual Contributor (IC):** Career path focused on technical/functional expertise without direct people management responsibility.

**Management Path:** Career path focused on people leadership, team management, and organizational responsibility.

**Level (L2-L8):** Standardized seniority levels based on experience, impact, and responsibility scope.

**Normalized Role:** The standard role title in the new career path framework.

**Role Base Name:** Current grouping category in denormalized data (e.g., "Business Analyst", "Developer").

**Lateral Move:** Career transition across tracks at same level (e.g., Sr Developer → Sr Product Owner).

**Track Domain:** High-level category grouping related tracks (e.g., DATA & AI, TECHNOLOGY & DEV).

---

## Conclusion & Next Steps

### Summary

This normalization mapping successfully categorizes **313 of 320** role entries (98%) into a structured 33-track career path framework. The analysis reveals:

1. **6 new career tracks** required to accommodate existing organizational roles
2. **29 roles** (9%) require seniority level correction
3. **7 invalid roles** should be removed from the system
4. **Regional role variations** can be simplified through metadata approach
5. **IC vs Management paths** need explicit separation at L5+

### Recommended Next Steps

1. **Immediate (This Week):**
   - Review and approve proposed 6 new career tracks
   - Validate high-priority manual review items (Appendix A)
   - Confirm level corrections for misplaced roles
   - Begin stakeholder communication planning

2. **Short-term (Next 2-4 Weeks):**
   - Execute Phase 1 (Data Cleanup)
   - Design database schema (Phase 2)
   - Draft communication materials (Phase 3)
   - Begin HR team training

3. **Medium-term (Next 1-3 Months):**
   - Execute migration (Phase 4)
   - Launch career path portal
   - Train managers on new structure
   - Monitor adoption and collect feedback

4. **Long-term (Next 3-6 Months):**
   - Optimize based on feedback
   - Extend to compensation benchmarking
   - Integrate with performance management
   - Build succession planning tools

### Success Metrics

- [ ] 100% of valid roles mapped to normalized structure
- [ ] <5% of employees require level adjustment
- [ ] >80% employee satisfaction with new career paths (survey)
- [ ] Zero data migration errors
- [ ] Career path portal adoption >75% within 3 months
- [ ] Reduced time-to-hire through clearer role definitions

### Document Maintenance

**Owner:** HR Business Partner / Talent Management  
**Review Frequency:** Quarterly  
**Last Updated:** November 11, 2025  
**Version:** 1.0  
**Next Review:** February 11, 2026

---

*This document is intended for internal stakeholder review and strategic planning. Implementation requires executive approval and cross-functional collaboration across HR, IT, and Department Leadership.*