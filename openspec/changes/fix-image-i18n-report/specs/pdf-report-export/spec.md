## ADDED Requirements

### Requirement: Generate PDF for Artwork
The system must generate a professional PDF report containing the artwork details and its full inspection history.

#### Scenario: User exports report for a specific artwork
- **WHEN** the user selects "Generate Report" from the Artwork Detail screen
- **THEN** a PDF is generated and the system share dialog is opened

### Requirement: Support Export Formats
The system must allow selecting between PDF, Excel, and CSV, although PDF is the priority.

#### Scenario: User selects PDF format
- **WHEN** the user chooses "PDF" in the Report Generator screen
- **THEN** the exported file is a valid PDF document
