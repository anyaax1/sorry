# Project notes

This repository contains the React/TypeScript Windows 95 portfolio frontend.
The README describes its implemented features, setup and remaining limitations.

## Development

- Use `npm ci` to install the lockfile dependencies.
- Run `npm run typecheck`, `npm run lint`, `npm run build` and `npm test` before publishing application changes.
- Browser tests start their own server on port 5177 and use synthetic API/PDF fixtures.
- Keep windows and controls reachable at narrow widths and after viewport changes.
- Keep minimized application state intact.
- Maintain keyboard and touch support alongside mouse interaction.

## Profile content

The backend supplies the CV and digital-twin profile. Personal documents, persona
text, backups, credentials and storage configuration belong outside this repository.
Do not add deployment archives. Use `.env.example` as a configuration template.
