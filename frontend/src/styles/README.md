# Styles Directory (`src/styles/`)

This directory centralizes all CSS stylesheets for Pocket Ledger.

```text
src/styles/
├── global/          # App-wide foundational styles, resets, design tokens, and layout
│   ├── index.css    # Font imports, base CSS reset, root defaults
│   └── App.css      # Master design system tokens, split-auth, themes, global components
│
├── pages/           # Page-level stylesheets
│   ├── Dashboard.css
│   └── Wallets.css
│
└── components/      # Reusable UI component stylesheets
    ├── AddCurrencyModal.css
    ├── CashFlowOverview.css
    ├── CategoriesTab.css
    ├── DeleteConfirmModal.css
    └── WalletBar.css
```

## Guidelines for Adding New Styles

- **Global rules & tokens**: Place in `src/styles/global/`
- **New page styles**: Place in `src/styles/pages/<PageName>.css`
- **New component styles**: Place in `src/styles/components/<ComponentName>.css`
