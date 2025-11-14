# Logo.dev Integration Guide

This application now supports displaying company logos for accounts and centers using Logo.dev.

## Features

✅ **Automatic logo fetching** - Displays company logos based on domain names
✅ **WebP format** - Uses WebP format for optimal performance and smaller file sizes
✅ **Responsive sizing** - 4 size options (sm, md, lg, xl)
✅ **Smart fallbacks** - Shows building icon when logo is unavailable
✅ **Lazy loading** - Optimized for performance with lazy image loading
✅ **Theme support** - Automatic light/dark mode logo selection
✅ **Domain cleaning** - Automatically extracts clean domain from various URL formats
✅ **Optimized scaling** - Logos scaled 1.15x to better fill circular containers
✅ **Table integration** - Logos appear in both detail dialogs and data table views

## Setup Instructions

### 1. Get Your Logo.dev API Token

1. Visit [Logo.dev](https://logo.dev) and sign up for a free account
2. Navigate to your dashboard and copy your **publishable API key** (starts with `pk_`)
3. The free tier includes enough requests for development and small applications

### 2. Configure Environment Variable

Create a `.env.local` file in your project root (or add to existing file):

```bash
NEXT_PUBLIC_LOGO_DEV_TOKEN=pk_your_actual_token_here
```

**Important:** Never commit your actual token to version control!

### 3. Data Requirements

The application expects the following fields in your data:

**Accounts Sheet:**
- `ACCOUNT WEBSITE` - Domain in format: `www.company.com` or `company.com`

**Centers Sheet:**
- `CENTER ACCOUNT WEBSITE` - Domain in format: `www.company.com` or `company.com`

Example data:
```
ACCOUNT NAME: Microsoft
ACCOUNT WEBSITE: www.microsoft.com

CENTER NAME: Microsoft India Development Center
CENTER ACCOUNT WEBSITE: www.microsoft.com
```

## Component Usage

The `CompanyLogo` component can be used anywhere in your application:

```tsx
import { CompanyLogo } from "@/components/ui/company-logo"

// Basic usage
<CompanyLogo
  domain="www.google.com"
  companyName="Google"
/>

// With all options
<CompanyLogo
  domain="www.microsoft.com"
  companyName="Microsoft"
  size="lg"              // sm, md, lg, xl
  theme="dark"           // light, dark, auto
  className="custom-class"
/>
```

## How It Works

### Domain Extraction
The component automatically cleans domain URLs:
- `www.microsoft.com` → `microsoft.com`
- `https://www.google.com` → `google.com`
- `apple.com/products` → `apple.com`

### Fallback Behavior
1. Component tries to load logo from Logo.dev
2. Shows loading state with building icon
3. If logo loads successfully, displays it
4. If logo fails to load or domain is invalid, shows building icon fallback

### Performance Optimizations
- **Lazy loading**: Images load only when they enter the viewport
- **Optimized sizes**: Requests appropriate image size based on display size
- **Caching**: Browser caches logos for faster subsequent loads
- **WebP format**: Uses WebP for 25-35% smaller file sizes compared to PNG
- **Smart scaling**: Logos scaled 1.15x with 10% padding to optimally fill circular containers

### Theme Support
- `auto`: Logo.dev automatically detects and serves appropriate logo
- `light`: Requests light mode logo (for dark backgrounds)
- `dark`: Requests dark mode logo (for light backgrounds)

## Current Implementation

### Account Details Dialog
- Logo appears in the header next to account name
- Uses `ACCOUNT WEBSITE` field for domain
- Size: `md` (48px)
- Theme: `auto`
- Format: WebP

Location: `/components/dialogs/account-details-dialog.tsx:73-78`

### Center Details Dialog
- Logo appears in the header next to center name
- Uses `CENTER ACCOUNT WEBSITE` field for domain
- Size: `md` (48px)
- Theme: `auto`
- Format: WebP

Location: `/components/dialogs/center-details-dialog.tsx:131-136`

### Accounts Table View
- Logo appears in the first column next to account name
- Uses `ACCOUNT WEBSITE` field for domain
- Size: `sm` (32px)
- Theme: `auto`
- Format: WebP

Location: `/components/tables/account-row.tsx:23-28`

### Centers Table View
- Logo appears in the first column next to account name
- Uses `CENTER ACCOUNT WEBSITE` field for domain
- Size: `sm` (32px)
- Theme: `auto`
- Format: WebP

Location: `/components/tables/center-row.tsx:18-23`

## Troubleshooting

### Logos not appearing?

1. **Check your API token**
   ```bash
   echo $NEXT_PUBLIC_LOGO_DEV_TOKEN
   ```

2. **Verify domain data**
   - Ensure `ACCOUNT WEBSITE` and `CENTER ACCOUNT WEBSITE` fields contain valid domains
   - Check for typos or extra spaces

3. **Check browser console**
   - Look for 404 errors (logo not found - this is normal for some companies)
   - Look for 401/403 errors (invalid API token)

4. **Check Logo.dev coverage**
   - Not all companies have logos in Logo.dev's database
   - Fallback icon will show automatically

### Building icon always showing?

- Verify the domain field contains a valid domain with at least one dot
- Check that the domain is not empty or just whitespace
- Try accessing the logo URL directly: `https://img.logo.dev/domain.com?token=YOUR_TOKEN`

## API Rate Limits

Logo.dev free tier includes:
- 10,000 requests per month
- Sufficient for most development and small production apps

For production applications with high traffic, consider:
- Caching logos on your server
- Using a CDN
- Upgrading to a paid Logo.dev plan

## Cost Considerations

- **Free tier**: Perfect for development and low-traffic apps
- **Paid tiers**: Available for high-volume applications
- **Self-hosting**: Logo.dev also offers self-hosted options

## Security Notes

- API token is a **publishable key** (safe to use in client-side code)
- Token should still be treated as sensitive (don't commit to public repos)
- Use environment variables for configuration
- Logo.dev URLs are served over HTTPS

## Future Enhancements

Possible improvements for the future:
- [ ] Server-side logo caching to reduce API calls
- [ ] Custom logo upload for companies not in Logo.dev
- [ ] Logo size optimization based on screen DPI
- [ ] Batch logo prefetching for tables
- [ ] Logo color extraction for dynamic theming

## Resources

- [Logo.dev Documentation](https://docs.logo.dev)
- [Logo.dev Dashboard](https://logo.dev/dashboard)
- [Component Source](/components/ui/company-logo.tsx)
