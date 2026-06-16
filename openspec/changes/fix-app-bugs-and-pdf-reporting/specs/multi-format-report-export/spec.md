## ADDED Requirements

### Requirement: Export report as CSV
The system MUST allow the user to export and share inspections of an artwork as a structured CSV file.

#### Scenario: Successful CSV Export
- **WHEN** the user selects the "CSV" format and triggers report generation in the Report Generator Screen
- **THEN** the system SHALL create a CSV text file with a UTF-8 BOM, write the header row and inspection rows, and open the system sharing sheet with the file uri.
