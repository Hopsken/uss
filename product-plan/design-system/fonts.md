# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or root CSS file:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Font Usage

| Role | Font | Where Used |
|------|------|-----------|
| **Heading** | Space Grotesk | Section titles, nav labels, card headers, stat labels, USS wordmark, category badges |
| **Body** | Inter | Body text, descriptions, list items, form inputs |
| **Mono** | JetBrains Mono | Token counts, cost values, cron expressions, log output, timestamps, version strings |

## Inline Application

```tsx
// Heading font
style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}

// Body (default — set at root)
style={{ fontFamily: '"Inter", system-ui, sans-serif' }}

// Mono
style={{ fontFamily: '"JetBrains Mono", monospace' }}
```

Or via Tailwind if you configure the font families in your config:

```
font-grotesk   → Space Grotesk
font-sans      → Inter (default body)
font-mono      → JetBrains Mono
```

## Design Notes

- **Space Grotesk** is used for all UI labels, headings, and navigation to create a technical/command-center feel with a modern geometric sans-serif
- **Inter** provides excellent readability for body copy, descriptions, and form inputs
- **JetBrains Mono** is used for all numeric data, technical identifiers, and monospaced content — giving data a code-editor aesthetic appropriate for an agent management tool
