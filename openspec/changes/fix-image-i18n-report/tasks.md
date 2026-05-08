## 1. Image Rendering Reliability

- [ ] 1.1 [TEST] Add unit tests for `ImageUtils.getImageUri` covering local paths, remote URLs, and edge cases (null, empty).
- [ ] 1.2 [INFRA] Implement `src/infrastructure/utils/ImageUtils.ts` with URI normalization (ensuring `file://` prefix).
- [ ] 1.3 [PRESENTATION] Update `ArtworkDetailScreen.tsx` to use normalized URIs for hero images.
- [ ] 1.4 [PRESENTATION] Update `SearchScreen.tsx` and `MapScreen.tsx` (bottom sheet) to use normalized URIs for result cards.

## 2. Full Application Internationalization

- [ ] 2.1 [I18N] Perform a complete sweep of hardcoded strings in `DashboardScreen`, `MapScreen`, `ReportGeneratorScreen`, and `ProfileScreen`.
- [ ] 2.2 [I18N] Update `src/infrastructure/i18n/locales/{pt,en,es}.json` with extracted strings.
- [ ] 2.3 [PRESENTATION] Refactor `DashboardScreen.tsx` to use `useTranslation` and the `t` function.
- [ ] 2.4 [PRESENTATION] Refactor `MapScreen.tsx` to use `useTranslation` for headers, labels, and the bottom sheet.
- [ ] 2.3 [PRESENTATION] Refactor `ReportGeneratorScreen.tsx` to use `useTranslation` for all form fields and buttons.
- [ ] 2.4 [PRESENTATION] Translate dynamic enums (Conservation Status, Artwork Type) in all list views.

## 3. PDF Report Generation

- [ ] 3.1 [TEST] Add unit tests for `GenerateReportUseCase` ensuring it handles missing images and generates valid HTML.
- [ ] 3.2 [DOMAIN] Enhance `GenerateReportUseCase.ts` to support professional styling and include images in the PDF.
- [ ] 3.3 [PRESENTATION] Implement state management and data fetching in `ReportGeneratorScreen.tsx`.
- [ ] 3.4 [PRESENTATION] Connect "Export PDF" button to `GenerateReportUseCase` with real data from the database.

## 4. Quality Assurance

- [ ] 4.1 [TEST] [E2E] Create a Maestro test flow: `Register Artwork → Perform Inspection → Capture Photo → Generate PDF Report`.
- [ ] 4.2 [TEST] Verify language switching persists across app restarts.
