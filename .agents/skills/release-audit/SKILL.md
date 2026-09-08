# Skill: release-audit

Auditor previo a compartir links o desplegar.

Checklist:
1. `npm run build` + `npm test` verdes.
2. `git status`: ningún `.env*` ni key en el diff (`git log -S sk-`).
3. Chat: mensaje genérico ante fallos; keys fuera del bundle si es prod.
4. Fuente+fecha visibles en overview y dashboard.
5. Túnel: avisar que es temporal; Vercel para permanente.
6. CHANGELOG actualizado.
