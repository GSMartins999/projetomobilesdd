## ADDED Requirements

### Requirement: Friendly Authentication Error Messages
The system MUST parse error responses from the auth server and display clear, localized messages to the user.

#### Scenario: Registering with existing email
- **WHEN** the user attempts to sign up with an email that is already registered in the system
- **THEN** the system SHALL capture the auth error and display a localized message stating that the email is already in use.

#### Scenario: Authentication rate limit exceeded
- **WHEN** the user triggers an authentication limit limit error from the auth server
- **THEN** the system SHALL display a clear, localized message stating that the rate limit has been exceeded and they should try again later.
