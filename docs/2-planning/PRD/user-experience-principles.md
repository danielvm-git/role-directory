# User Experience Principles

**Goal: Functional clarity over visual polish**

## Visual Design

**Clean and Functional Approach:**
- Use UI component library for speed (Tailwind CSS + shadcn/ui recommended)
- Simple layout: centered forms, clear hierarchy, adequate whitespace
- Minimal color palette: Primary action color, error red, neutral grays
- System fonts (no custom typography needed)
- No animations or transitions (unless provided by component library)
- Responsive grid: Single column on mobile, multi-column on desktop where appropriate

**Priority: Fast to build, easy to maintain**

## Key User Flows

**1. Invitation Code Entry**
- Landing page with centered code input form
- Clear call-to-action: "Enter Invitation Code"
- Real-time validation feedback (client-side format check)
- Clear success state: Immediate redirect to dashboard
- Clear error states (see Error Handling below)

**2. Authenticated Dashboard Experience**
- Simple navigation (if multiple pages exist in future)
- Hello World page displays query results clearly
- Table format for database results (sortable if easy, not required)
- Query performance metric displayed: "Query executed in Xms"
- Logout button clearly visible

**3. Session Expiry Handling**
- Session expiry detected on any protected page request
- Clear message: "Your session has expired (24-hour limit)"
- Automatic redirect to code entry page after 3 seconds (or immediate with button)
- Allow user to enter new code without losing context

## Error Handling

**Helpful and Specific:**

**Invalid Code Errors:**
- "Code not found. Please check your code and try again."
- "Code has expired. Please request a new code."
- "Code format invalid. Codes are 8-12 alphanumeric characters."

**Session Errors:**
- "Your session has expired. Please enter a new invitation code."
- "Session not found. Please log in again."

**Database/System Errors:**
- "Unable to connect to database. Please try again in a moment."
- "An unexpected error occurred. Please contact the administrator."
- (Include error ID for debugging in logs, not shown to user)

**Form Validation:**
- Inline validation with red border + error message below field
- Disable submit button until valid input provided
- Loading state during submission ("Validating code...")

## Interaction Patterns

**Forms:**
- Single-column layout
- Labels above inputs
- Focus state clearly visible (outline)
- Enter key submits form

**Buttons:**
- Primary: Solid background (call-to-action)
- Secondary: Outline or ghost style
- Disabled state: Reduced opacity + no hover effect
- Loading state: Spinner + "Processing..." text

**Data Display:**
- Tables for structured data (Hello World query results)
- Alternating row colors for readability
- Monospace font for technical data (database version, IDs)
- Responsive tables: Horizontal scroll on mobile if needed

**No Complex Interactions Required:**
- No drag-and-drop
- No modals or overlays (unless component library makes them trivial)
- No real-time updates or WebSockets
- No interactive charts or visualizations

---
