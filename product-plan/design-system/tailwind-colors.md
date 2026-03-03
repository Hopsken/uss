# Tailwind Color Configuration

## Color Choices

- **Primary:** `sky` — Used for buttons, links, active nav states, key accents
- **Secondary:** `amber` — Used for warnings, busy/active status indicators, highlights
- **Neutral:** `slate` — Used for backgrounds, borders, body text, sidebar

## Common Usage Patterns

### Primary (sky)
```
Primary button:       bg-sky-500 hover:bg-sky-600 text-white
Active nav item:      bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400
Link:                 text-sky-500 hover:text-sky-400
Focus ring:           focus-visible:ring-sky-500
Input focus:          focus:border-sky-400 dark:focus:border-sky-600
Selected border:      border-l-2 border-l-sky-400
```

### Secondary (amber)
```
Warning text:         text-amber-600 dark:text-amber-400
Warning badge:        bg-amber-50 border-amber-200 text-amber-700
Busy status dot:      bg-amber-500 animate-pulse
Top spender:          text-amber-600 dark:text-amber-400 font-semibold
```

### Neutral (slate)
```
Page background:      bg-slate-50 dark:bg-slate-950
Card/panel bg:        bg-white dark:bg-slate-900
Sidebar bg:           bg-white dark:bg-slate-900
Border:               border-slate-200 dark:border-slate-800
Divider:              border-slate-100 dark:border-slate-800
Heading text:         text-slate-900 dark:text-white
Body text:            text-slate-700 dark:text-slate-300
Muted text:           text-slate-400 dark:text-slate-500
Hover bg:             hover:bg-slate-50 dark:hover:bg-slate-800
Input bg:             bg-slate-50 dark:bg-slate-800
```

## Status Colors

```
Idle/healthy:   bg-slate-400 (dot), text-slate-500
Busy/warning:   bg-amber-500 animate-pulse (dot), text-amber-600
Error/down:     bg-red-500 (dot), text-red-600
Running:        bg-sky-500 animate-spin (spinner)
Done/success:   bg-emerald-500 (dot), text-emerald-600
```
