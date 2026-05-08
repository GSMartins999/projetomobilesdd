## Why

This change addresses three critical areas for the Curata app's production readiness:
1. **User Trust & Data Visualization**: Captured photos are central to the app's value proposition. Ensuring they render correctly in both summary and detail views is essential.
2. **Accessibility & Global Reach**: The app currently has hardcoded strings in several core screens (Dashboard, Map, Reports), preventing non-Portuguese speakers from using it effectively despite the i18n infrastructure.
3. **Professional Deliverables**: The report generation feature is currently a mockup. Users need the ability to export their findings in a portable format (PDF) for stakeholders.

## What Changes

- **Image Rendering Engine**: 
  - Audit and fix the photo loading logic in `ArtworkDetailScreen` and `SearchScreen`.
  - Ensure `file://` URIs are correctly handled across platforms.
  - Implement a fallback mechanism for images that fail to load or are missing.
- **System-Wide Internationalization**:
  - Integrate `react-i18next` into all core screens (`Dashboard`, `Map`, `ReportGenerator`, `Profile`, etc.).
  - Extract hardcoded strings into `en.json`, `es.json`, and `pt.json`.
- **Report Generation Engine**:
  - Connect `ReportGeneratorScreen` to `GenerateReportUseCase`.
  - Implement basic PDF generation using `expo-print` and `expo-sharing`.
  - Support exporting a summary of all artworks or a specific filtered set.

## Capabilities

### New Capabilities
- `pdf-report-export`: Allows users to generate and share a PDF report of their artworks and inspections directly from the app.
- `localized-ui`: Ensures 100% of the user interface respects the selected language (PT, EN, ES).

### Modified Capabilities
- `artwork-gallery`: Improvements to how images are fetched and displayed in cards and detail views to ensure high reliability.

## Impact

- **Infrastructure**: Updates to `i18n` locales.
- **Presentation Layer**: Major refactoring of `DashboardScreen`, `MapScreen`, and `ReportGeneratorScreen` to support translations and real data.
- **Domain Layer**: Minor enhancements to `GenerateReportUseCase` to support multi-artwork reports.
