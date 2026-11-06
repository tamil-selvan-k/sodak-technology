# Company Logos

This folder is for storing company logo images to be displayed in the homepage marquee.

## Current Setup

The homepage currently uses Clearbit logo API (https://logo.clearbit.com/) to automatically fetch company logos. This works for most major companies.

## To Use Custom Logos

If you want to use your own logo files instead of Clearbit API:

1. **Add logo files** to this folder:
   - zoho.png (or .svg)
   - tcs.png
   - deloitte.png
   - accenture.png
   - cognizant.png
   - paypal.png
   - amazon.png
   - northern-arc.png

2. **Update the homepage** (`src/app/(public)/page.tsx`):
   ```typescript
   const COMPANIES = [
     { name: 'Zoho', logo: '/images/companies/zoho.png' },
     { name: 'TCS', logo: '/images/companies/tcs.png' },
     // ... etc
   ]
   ```

## Logo Requirements

- **Format**: PNG or SVG recommended
- **Size**: Max width 280px, max height 120px (will be scaled down)
- **Background**: Transparent or white background works best
- **Aspect ratio**: Logos will be contained within their bounds
- **File naming**: Use lowercase with hyphens (e.g., `northern-arc.png`)

## Notes

- Logos are displayed with grayscale filter by default
- On hover, full color is shown
- Responsive design automatically adjusts logo sizes for mobile devices
