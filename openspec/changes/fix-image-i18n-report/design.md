## Context

The Curata application is in a transitional state from mockup to fully functional. While the core database and navigation are in place, three major features are incomplete or broken:
1. **Image Rendering**: Photos captured during inspections are not displaying reliably.
2. **Internationalization**: Core screens are still hardcoded in Portuguese.
3. **Report Generation**: The export feature is a UI mockup with no underlying logic.

## Goals / Non-Goals

**Goals:**
- Fix photo rendering in `ArtworkDetailScreen`, `SearchScreen`, and `MapScreen` (bottom sheet).
- Ensure 100% UI translation coverage for PT, EN, and ES.
- Implement PDF report generation for specific artworks and general summaries.

**Non-Goals:**
- Implementing cloud-based PDF generation (will use local `expo-print`).
- Redesigning the image storage architecture (will fix the current path-based system).
- Adding new languages beyond PT, EN, ES.

## Decisions

### 1. Robust Image Loading
- **Normalization**: Create a utility function `getImageUri(path)` that ensures local paths have the `file://` prefix and handles fallback to remote URLs or placeholders.
- **Cache Policy**: Use standard React Native `Image` component but ensure paths are sanitized.

### 2. Systematic i18n Refactor
- **Screen Audit**: Refactor `DashboardScreen`, `MapScreen`, `ReportGeneratorScreen`, and `ProfileScreen` to use the `t` function.
- **Centralized Locales**: Populate `pt.json`, `en.json`, and `es.json` with all missing keys discovered during the audit.
- **Dynamic Enums**: Translate status labels and artwork types using the i18n keys (e.g., `t('status.urgent')`).

### 3. PDF Generation Implementation
- **Logic**: Use `expo-print` to generate HTML-to-PDF.
- **Data Gathering**: Implement logic in `ReportGeneratorScreen` to fetch necessary data (artworks, inspections, photos) to pass to `GenerateReportUseCase`.
- **Formatting**: Improve the HTML template in `GenerateReportUseCase` to include images (using base64 or local paths) and a professional layout.

## Risks / Trade-offs

- **PDF Image Handling**: Local paths in HTML for `expo-print` can be tricky. We may need to convert images to base64 if direct path reference fails.
- **I18n Overhead**: Refactoring all screens is time-consuming and prone to missing small labels. A thorough sweep is required.
- **Memory Consumption**: Generating PDFs with many images might stress low-end devices. We will limit the number of photos per report if necessary.
