# Okta Expression Builder

A free, open-source visual builder for Okta Expression Language (EL). Build profile mappings, group rules, and conditional expressions visually — no more writing EL by hand in a tiny text box.

## Features

- **Easy Mode** — Visual tree builder where you pick functions from a catalog and fill argument slots
- **Advanced Mode** — Code editor with autocomplete, inline error highlighting, and hover tooltips
- **App Profile with HRIS Presets** — Test `app.*` attributes with preloaded data from Workday, BambooHR, SAP SuccessFactors, UKG Pro, and Aquera (ADP)
- **Live Preview** — Expressions evaluate in real-time against editable user and app test profiles
- **One-Click Copy** — Copy the generated expression string to your clipboard
- **Complete EL Coverage** — String, Array, Conversion, Directory, Manager, and Time functions, plus arithmetic operators, single-quoted strings, and array literals
- **Test Profiles** — Pre-filled with standard Okta user attributes, editable values, and custom attribute support

## Getting Started

```bash
npm ci
npm run dev
```

Open `http://localhost:5173/okta-expression-builder/` in your browser.

## Development

```bash
npm ci              # Install dependencies
npm run dev         # Start dev server
npm run build       # Production build
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

## Tech Stack

- React 19 + TypeScript
- Vite (bundler/dev server)
- Tailwind CSS 4
- Vitest + React Testing Library

## How It Works

Both modes operate on the same `ExpressionNode` tree model — switching between Easy and Advanced mode preserves the current expression.

The expression engine has four modules:
- **Serializer** — Converts the tree into an Okta EL string
- **Parser** — Converts an EL string back into a tree (with structured error positions for inline highlighting)
- **Evaluator** — Evaluates the tree against user and app test profiles for live preview
- **Validator** — Checks for missing arguments, unknown functions, and syntax errors

The profile panel supports both user attributes (`user.*`) and app attributes (`app.*` / `appuser.*`). Load an HRIS preset to populate app attributes with realistic sample data from common integrations.

## License

MIT
