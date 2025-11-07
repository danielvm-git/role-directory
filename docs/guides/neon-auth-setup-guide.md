# Neon Auth Setup Guide

**Project:** role-directory  
**Date:** 2025-11-06  
**Estimated Setup Time:** 2-4 hours

---

## Overview

This guide walks you through setting up Neon Auth for authentication in your Next.js application deployed to Cloud Run.

**What you'll set up:**
- Neon Auth project with OAuth providers (Google/GitHub)
- Next.js integration with `@neonauth/nextjs` SDK
- Email whitelist for access control
- User data auto-sync to Neon PostgreSQL

**References:**
- [Neon Auth Overview](https://neon.com/docs/neon-auth/overview)
- [Neon Auth Next.js Getting Started](https://neon.com/docs/neon-auth/getting-started/nextjs)

---

## Prerequisites

- Neon account with PostgreSQL databases already created (dev, stg, prd)
- Next.js 15 project initialized
- Google Cloud Project with Cloud Run services created

---

## Step 1: Create Neon Auth Project

### 1.1: Navigate to Neon Console

1. Go to https://console.neon.tech
2. Select your project: **role-directory**
3. Click **"Neon Auth"** in the sidebar (beta feature)

### 1.2: Enable Neon Auth

```
1. Click "Enable Neon Auth"
2. Choose your primary database: role_directory_dev
3. Neon Auth will automatically create required tables
```

### 1.3: Get Project Credentials

```
Neon Auth Project ID: [COPY THIS]
Secret Key: [COPY THIS - treat like a password]
```

**Save these - you'll need them for environment variables.**

---

## Step 2: Configure OAuth Providers

### 2.1: Set Up Google OAuth

**Create Google OAuth Application:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Click **"Create Credentials" → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Name: `role-directory-neon-auth`
6. Authorized redirect URIs:
   ```
   https://auth.neon.tech/callback/google
   https://role-directory-dev-[hash].run.app/api/auth/callback/google
   https://role-directory-stg-[hash].run.app/api/auth/callback/google
   https://role-directory-prd-[hash].run.app/api/auth/callback/google
   ```
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

**Configure in Neon Console:**

1. Back in Neon Console → Neon Auth → OAuth Providers
2. Click **"Add Provider" → Google**
3. Paste Client ID and Client Secret
4. Save

### 2.2: Set Up GitHub OAuth (Optional)

**Create GitHub OAuth App:**

1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Application name: `role-directory`
4. Homepage URL: `https://role-directory-prd-[hash].run.app`
5. Authorization callback URL:
   ```
   https://auth.neon.tech/callback/github
   ```
6. Click **Register application**
7. Generate a new client secret
8. Copy **Client ID** and **Client Secret**

**Configure in Neon Console:**

1. Neon Console → Neon Auth → OAuth Providers
2. Click **"Add Provider" → GitHub**
3. Paste Client ID and Client Secret
4. Save

---

## Step 3: Install Neon Auth SDK

### 3.1: Install Dependencies

```bash
cd /Users/me/Sites/role-directory

npm install @neonauth/nextjs
```

### 3.2: Create Neon Auth Configuration

Create `lib/stack.ts`:

```typescript
import { StackServerApp, StackClientApp } from "@neonauth/nextjs";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  },
});

export const stackClientApp = new StackClientApp({
  tokenStore: "cookie",
  baseUrl: process.env.NEXT_PUBLIC_STACK_URL,
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
});
```

---

## Step 4: Configure Environment Variables

### 4.1: Create `.env.local` (Development)

```bash
# Neon Auth
NEXT_PUBLIC_STACK_PROJECT_ID="your-neon-auth-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-publishable-key"
STACK_SECRET_SERVER_KEY="your-secret-server-key"

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/role_directory_dev?sslmode=require"

# Access Control (Email Whitelist)
ALLOWED_EMAILS="danielvm@example.com,collaborator@example.com"

# Next.js
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4.2: Add to Google Secret Manager (Production)

```bash
# Store Neon Auth secrets
echo -n "your-neon-auth-project-id" | \
  gcloud secrets create NEON_AUTH_PROJECT_ID --data-file=-

echo -n "your-secret-server-key" | \
  gcloud secrets create NEON_AUTH_SECRET_KEY --data-file=-

echo -n "your-publishable-key" | \
  gcloud secrets create NEON_AUTH_PUBLISHABLE_KEY --data-file=-

# Store allowed emails
echo -n "danielvm@example.com,collaborator@example.com" | \
  gcloud secrets create ALLOWED_EMAILS --data-file=-
```

### 4.3: Update Cloud Run Services

```bash
# Development
gcloud run services update role-directory-dev \
  --set-secrets="NEON_AUTH_PROJECT_ID=NEON_AUTH_PROJECT_ID:latest,NEON_AUTH_SECRET_KEY=NEON_AUTH_SECRET_KEY:latest,ALLOWED_EMAILS=ALLOWED_EMAILS:latest" \
  --region=us-central1

# Staging
gcloud run services update role-directory-stg \
  --set-secrets="NEON_AUTH_PROJECT_ID=NEON_AUTH_PROJECT_ID:latest,NEON_AUTH_SECRET_KEY=NEON_AUTH_SECRET_KEY:latest,ALLOWED_EMAILS=ALLOWED_EMAILS:latest" \
  --region=us-central1

# Production
gcloud run services update role-directory-prd \
  --set-secrets="NEON_AUTH_PROJECT_ID=NEON_AUTH_PROJECT_ID:latest,NEON_AUTH_SECRET_KEY=NEON_AUTH_SECRET_KEY:latest,ALLOWED_EMAILS=ALLOWED_EMAILS:latest" \
  --region=us-central1
```

---

## Step 5: Implement Authentication

### 5.1: Create Sign-In Page

Create `app/auth/signin/page.tsx`:

```typescript
import { SignIn } from "@neonauth/nextjs/components";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Sign In to role-directory
        </h1>
        <SignIn />
      </div>
    </div>
  );
}
```

### 5.2: Create Middleware for Protected Routes

Create `middleware.ts`:

```typescript
import { stackServerApp } from "@/lib/stack";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication for public routes
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const user = await stackServerApp.getUser();

  if (!user) {
    // Redirect to sign-in
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Email whitelist check
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];
  if (allowedEmails.length > 0 && !allowedEmails.includes(user.primaryEmail || "")) {
    return NextResponse.json(
      { error: "Access restricted. Contact admin for access." },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (Neon Auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 5.3: Create Dashboard Page

Create `app/dashboard/page.tsx`:

```typescript
import { stackServerApp } from "@/lib/stack";
import { UserButton } from "@neonauth/nextjs/components";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db"; // Your PostgreSQL connection

export default async function DashboardPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Query database
  const start = Date.now();
  const result = await pool.query("SELECT * FROM role_profiles LIMIT 10");
  const queryTime = Date.now() - start;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hello World Dashboard</h1>
        <UserButton />
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Info</h2>
        <p>
          <strong>Name:</strong> {user.displayName || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.primaryEmail}
        </p>
        <p>
          <strong>Provider:</strong> {user.oauthProviders[0]?.id || "Email"}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Database Query Results</h2>
        <p className="text-sm text-gray-600 mb-4">
          {result.rows.length} rows returned in {queryTime}ms
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {result.fields.map((field) => (
                  <th key={field.name} className="px-4 py-2 border">
                    {field.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                  {result.fields.map((field) => (
                    <td key={field.name} className="px-4 py-2 border">
                      {row[field.name]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Test Locally

### 6.1: Run Development Server

```bash
npm run dev
```

### 6.2: Test Authentication Flow

1. Navigate to http://localhost:3000
2. Should redirect to `/auth/signin`
3. Click "Sign in with Google" (or GitHub)
4. Complete OAuth flow
5. Should redirect to `/dashboard`
6. Verify user info displays
7. Verify database query results display

### 6.3: Test Email Whitelist

1. Add your email to `ALLOWED_EMAILS` in `.env.local`
2. Sign in → Should work
3. Try signing in with non-whitelisted email → Should see 403 error

---

## Step 7: Deploy to Cloud Run

### 7.1: Build and Push Docker Image

```bash
# Build
docker build -t gcr.io/$PROJECT_ID/role-directory:latest .

# Push
docker push gcr.io/$PROJECT_ID/role-directory:latest
```

### 7.2: Deploy to Dev

```bash
gcloud run deploy role-directory-dev \
  --image=gcr.io/$PROJECT_ID/role-directory:latest \
  --region=us-central1
```

### 7.3: Test in Dev Environment

1. Get dev URL: `gcloud run services describe role-directory-dev --region=us-central1 --format="value(status.url)"`
2. Navigate to URL
3. Test OAuth flow
4. Verify dashboard works

### 7.4: Promote to Staging and Production

Follow manual promotion workflow from PRD.

---

## Step 8: Manage Access (Add/Remove Users)

### Add User to Whitelist

```bash
# Update secret
echo -n "danielvm@example.com,new-user@example.com" | \
  gcloud secrets versions add ALLOWED_EMAILS --data-file=-

# Redeploy (to pick up new secret)
gcloud run services update role-directory-dev --region=us-central1
```

### Remove User from Whitelist

```bash
# Update secret (remove email)
echo -n "danielvm@example.com" | \
  gcloud secrets versions add ALLOWED_EMAILS --data-file=-

# Redeploy
gcloud run services update role-directory-dev --region=us-central1
```

---

## Troubleshooting

### OAuth Redirect URI Mismatch

**Error:** "redirect_uri_mismatch"

**Fix:**
1. Ensure all Cloud Run URLs are added to OAuth provider's allowed redirect URIs
2. Check for typos in URLs
3. Include both `https://auth.neon.tech/callback/google` and your app's callback URLs

### User Not Syncing to Database

**Symptom:** User can sign in but no data in database

**Check:**
1. Neon Auth is enabled in Neon Console
2. Neon Auth has permission to write to database
3. Check Neon Console → Neon Auth → Logs for sync errors

### Email Whitelist Not Working

**Symptom:** Non-whitelisted users can access dashboard

**Check:**
1. Middleware is configured correctly
2. `ALLOWED_EMAILS` secret exists in Secret Manager
3. Cloud Run service has permission to access secret
4. Redeploy after updating secret

---

## Next Steps

✅ Authentication working  
✅ User data syncing to Neon PostgreSQL  
✅ Email whitelist enforced  
✅ Dashboard displaying data  

**Now you can:**
1. Add more collaborators (update `ALLOWED_EMAILS`)
2. Deploy through staging and production
3. Start building actual features on top of proven infrastructure

---

**References:**
- [Neon Auth Documentation](https://neon.com/docs/neon-auth/overview)
- [Neon Auth Next.js SDK](https://neon.com/docs/neon-auth/getting-started/nextjs)
- [Neon Auth Components](https://neon.com/docs/neon-auth/components/all-components)

