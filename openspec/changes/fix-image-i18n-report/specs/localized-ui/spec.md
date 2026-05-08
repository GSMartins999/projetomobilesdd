## ADDED Requirements

### Requirement: Global Internationalization
All visible text in the application must be localized according to the user's selected language.

#### Scenario: User changes language to English
- **WHEN** the user selects "English" in the Profile screen
- **THEN** all screens (Dashboard, Map, Search, Reports) update their text to English immediately

### Requirement: Translated Enums
Dynamic data like conservation status (Bom, Regular, etc.) and artwork types must be translated.

#### Scenario: Displaying status on a card
- **WHEN** an artwork with status "good" is displayed and language is English
- **THEN** the label shows "Good" instead of "Bom"
