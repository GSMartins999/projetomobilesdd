## ADDED Requirements

### Requirement: Render artwork photos in PDF
The PDF generator MUST include and render the local or remote photos associated with the artwork inspections.

#### Scenario: Successful PDF Photo Rendering
- **WHEN** the PDF report is generated for an artwork with inspections that have photos
- **THEN** the system SHALL resolve local image paths with valid "file://" prefixes on Android and remote URLs to ensure they render inside the generated PDF document.
