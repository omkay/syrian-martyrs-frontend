# Email Verification Setup

This document explains how to configure and use the email verification system in the Syrian Martyrs Memorial application.

## Environment Variable Configuration

The email verification system is controlled by the `REQUIRE_EMAIL_VERIFICATION` environment variable.

### Setting Up Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Configure email verification:**
   ```bash
   # In your .env.local file
   
   # For development (skip email verification)
   REQUIRE_EMAIL_VERIFICATION="false"
   
   # For production (require email verification)
   REQUIRE_EMAIL_VERIFICATION="true"
   ```

## How It Works

### When `REQUIRE_EMAIL_VERIFICATION="true"` (Production Mode)

1. **User Registration:**
   - User fills out signup form
   - Account is created with `isVerified: false`
   - Email verification token is generated
   - User receives email with verification link
   - User must verify email before logging in

2. **Login Process:**
   - System checks if user is verified
   - Unverified users cannot log in
   - Error message: "Please verify your email address before logging in"

3. **Email Verification:**
   - User clicks verification link
   - Token is validated and expires after 24 hours
   - User account is marked as verified
   - User can now log in normally

### When `REQUIRE_EMAIL_VERIFICATION="false"` (Development Mode)

1. **User Registration:**
   - User fills out signup form
   - Account is created with `isVerified: true`
   - No email verification token is generated
   - User can log in immediately

2. **Login Process:**
   - No verification check is performed
   - Users can log in regardless of verification status

## Testing the Feature

### 1. Test with Verification Enabled

```bash
# Set environment variable
export REQUIRE_EMAIL_VERIFICATION="true"

# Start the application
npm run dev

# Try signing up - user will need email verification
# Try logging in with unverified account - should fail
```

### 2. Test with Verification Disabled

```bash
# Set environment variable
export REQUIRE_EMAIL_VERIFICATION="false"

# Start the application
npm run dev

# Try signing up - user will be verified immediately
# Try logging in - should work without verification
```

### 3. Run Test Script

```bash
# Run the verification toggle test
npx tsx scripts/test-verification-toggle.ts
```

## Database Schema

The email verification system uses these fields in the `User` model:

```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  name                  String?
  password              String
  role                  UserRole  @default(USER)
  isVerified            Boolean   @default(false)
  emailVerificationToken String?
  emailVerificationExpires DateTime?
  // ... other fields
}
```

## API Endpoints

### Signup
- **Endpoint:** `POST /signup`
- **Behavior:** Creates user with verification status based on env var
- **Response:** Includes `requiresVerification` flag

### Login
- **Endpoint:** `POST /login`
- **Behavior:** Checks verification status if required by env var
- **Response:** Success/failure based on verification requirements

### Email Verification
- **Endpoint:** `GET /verify-email?token=<token>`
- **Behavior:** Validates token and marks user as verified
- **Response:** Success/failure message

## Production Setup

For production deployment:

1. **Set environment variable:**
   ```bash
   REQUIRE_EMAIL_VERIFICATION="true"
   ```

2. **Configure email service:**
   - Add email service (SendGrid, AWS SES, etc.)
   - Update the signup action to send actual emails
   - Customize email templates

3. **Email template example:**
   ```html
   <h1>Verify Your Email</h1>
   <p>Click the link below to verify your account:</p>
   <a href="${verificationUrl}">Verify Email</a>
   <p>This link expires in 24 hours.</p>
   ```

## Security Considerations

1. **Token Security:**
   - Tokens are cryptographically secure
   - Tokens expire after 24 hours
   - Tokens are single-use

2. **Rate Limiting:**
   - Consider implementing rate limiting for signup attempts
   - Consider implementing rate limiting for verification attempts

3. **Email Security:**
   - Use HTTPS for verification links
   - Validate email domains if needed
   - Implement email bounce handling

## Troubleshooting

### Common Issues

1. **Users can't log in after signup:**
   - Check if `REQUIRE_EMAIL_VERIFICATION="true"`
   - Verify user's `isVerified` status in database
   - Check if verification token has expired

2. **Verification emails not sent:**
   - Email service not configured (currently simulated)
   - Check email service credentials
   - Verify email templates

3. **Environment variable not working:**
   - Ensure variable is set in correct environment file
   - Restart the application after changing env vars
   - Check for typos in variable name

### Debug Commands

```bash
# Check user verification status
npx prisma studio

# View environment variables
echo $REQUIRE_EMAIL_VERIFICATION

# Test database connection
npx tsx scripts/test-db.ts
```

## Future Enhancements

1. **Email Service Integration:**
   - SendGrid integration
   - AWS SES integration
   - Custom SMTP configuration

2. **Advanced Features:**
   - Resend verification email
   - Change email address
   - Email verification reminders

3. **Analytics:**
   - Track verification rates
   - Monitor failed verification attempts
   - User engagement metrics
