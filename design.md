# SmartWaste Design System — Cyber-Eco Tech Theme

This document defines the **Cyber-Eco Tech (Obsidian & Jade-Cyan)** design system used for the SmartWaste application. Follow these specifications, colors, styles, and templates when designing new pages to maintain visual consistency.

---

## 1. Color Palette

The color system supports dual-theme configurations (light and dark mode) using Tailwind CSS variables and standard modifiers.

### A. Dark Mode (Obsidian Cyber)
*   **Base Floor (Background):** `#030712` (Obsidian Black)
*   **Card Container Fill:** `rgba(15, 23, 42, 0.6)` (Slate-900 / Transparent)
*   **Primary Accent:** `#00ff9d` (Neon Jade Green)
*   **Secondary Accent:** `#06b6d4` (Teal-Cyan)
*   **Border Accents:** `rgba(255, 255, 255, 0.05)` (Thin transparent white border lines)
*   **Primary Text:** `#f8fafc` (Slate-50)
*   **Muted Text:** `#94a3b8` (Slate-400)

### B. Light Mode (Eco Slate)
*   **Base Floor (Background):** `bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200`
*   **Card Container Fill:** `bg-white` (Solid pure white card base)
*   **Primary Accent:** `#16a34a` (Brand Green-600) / `#10b981` (Emerald)
*   **Secondary Accent:** `#06b6d4` (Teal-Cyan)
*   **Border Accents:** `border-slate-200`
*   **Primary Text:** `#0f172a` (Slate-900)
*   **Muted Text:** `#475569` (Slate-600)

---

## 2. Typography

The typography system uses a clean geometric display font for headlines and an ultra-readable sans-serif font for details and system controls.

*   **Display Font (Headings, Stats):** `"Plus Jakarta Sans", sans-serif`
*   **Body & System Font (Inputs, Text):** `"Inter", system-ui, sans-serif`

### Heading Hierarchy:
*   **Hero Heading:** `text-4xl md:text-6xl font-extrabold font-display leading-tight tracking-tight`
*   **Section Heading:** `text-3xl md:text-4xl font-extrabold font-display tracking-tight`
*   **Card Heading:** `text-lg md:text-xl font-bold font-display`
*   **Subtitles/Metadata:** `text-xs font-mono tracking-widest uppercase`

---

## 3. UI Component Templates (Tailwind Classes)

### A. Core Page Wrapper
Use this container wrapper on every page to ensure correct gradients and grids render in the background:
```jsx
<div className="min-h-screen bg-slate-50 text-slate-850 dark:bg-[#030712] dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-300">
  {/* Cyber Grid pattern */}
  <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40 dark:opacity-30" />
  
  {/* Blurred background circles */}
  <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-green-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />
  <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[120px] pointer-events-none" />

  {/* Page Content goes here */}
</div>
```

### B. Translucent Glass Card (Responsive Theme Support)
Use this template for grids, features, list elements, or sections:
```jsx
<div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl relative transition-all duration-300">
  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500/5 dark:from-[#00ff9d]/5 to-transparent pointer-events-none" />
  {/* Content */}
</div>
```

### C. Primary Action Button (Gradient)
Use this button for primary tasks (e.g. submit buttons, key routes):
```jsx
<button className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold text-sm hover:shadow-xl hover:shadow-green-600/25 dark:hover:shadow-[#00ff9d]/25 hover:scale-[1.03] transition-all duration-200">
  Action Text
</button>
```

### D. Secondary/Outline Button
Use this button for secondary actions (e.g. cancel, reset, secondary links):
```jsx
<button className="px-8 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-350 dark:hover:border-slate-750 hover:scale-[1.03] transition-all duration-200">
  Action Text
</button>
```

### E. Glowing Status Pulser Badge
Use this for status pill badges or notifications:
```jsx
<div className="inline-flex items-center gap-2 bg-green-500/10 dark:bg-[#00ff9d]/5 border border-green-500/20 dark:border-[#00ff9d]/20 rounded-full px-4 py-1.5 text-xs font-bold tracking-wider text-green-700 dark:text-[#00ff9d] uppercase">
  <span className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-[#00ff9d] animate-pulse" />
  Badge Title
</div>
```

### F. Form Inputs (Text/Select inputs)
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Input Label</label>
  <input 
    type="text" 
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 dark:bg-gray-700 dark:text-white outline-none transition-all text-sm"
    placeholder="Placeholder text" 
  />
</div>
```

---

## 4. Custom Keyframe Animations (Available in CSS)

These classes are configured in `index.css` and are available globally:
*   `.cyber-grid`: Integrates the light/dark responsive grid background pattern.
*   `.pulse-ring`: Smoothly pulses elements (used on the hero illustration container).
*   `.scanline-container` / `.scanline-line`: Incorporates a vertical scanning laser sweep (used in scanner demo screens).
*   `.compare-slider`: Stylizes range slider controls to display glowing centered selector handles.
