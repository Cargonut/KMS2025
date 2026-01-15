# OWASP 2025 Security Checklist – Carsharing App

Verwende diese Checkliste bei jedem Pull Request, um sicherzustellen, dass das OWASP-Top-10-Playbook eingehalten wird.

---

## A01: Broken Access Control
- [ ] Serverseitige Autorisierung für alle neuen/geänderten Endpoints geprüft  
- [ ] Ownership validiert (`user.id === resource.ownerId`)  
- [ ] Keine Client-Checks als Sicherheit verwendet  

---

## A02: Security Misconfiguration
- [ ] `.env` nicht versioniert  
- [ ] Playground/Debug-Tools nur in Dev aktiviert  
- [ ] Security Headers gesetzt (CSP, HSTS, CORS)  

---

## A03: Software Supply Chain Failures
- [ ] Alle Dependencies auditiert (`npm audit` / `yarn audit`)  
- [ ] Sicherheitsupdates eingespielt  
- [ ] Keine ungeprüften Pakete hinzugefügt  

---

## A04: Cryptographic Failures
- [ ] Passwort-Hashing via bcrypt ≥ 12 Salt-Rounds  
- [ ] JWT-Signatur geheim, kein Hardcoding  
- [ ] TLS für Transport aktiviert  
- [ ] Sensible Daten nicht im Klartext  

---

## A05: Injection
- [ ] Prisma Queries parametrisiert  
- [ ] Keine dynamischen Strings in Resolvern  
- [ ] Input validiert (Whitelist/Pattern)  

---

## A06: Insecure Design
- [ ] Threat Modeling für neues Feature durchgeführt  
- [ ] Autorisierungsregeln von Anfang an implementiert  
- [ ] Security Review vor Release  

---

## A07: Authentication Failures
- [ ] JWT Ablaufzeiten korrekt gesetzt  
- [ ] Refresh Tokens sicher implementiert  
- [ ] Rate-Limits auf Login / Reset  
- [ ] MFA optional für Admins  

---

## A08: Software or Data Integrity Failures
- [ ] Input validiert  
- [ ] Datei-Uploads geprüft / gesichert  
- [ ] Hashes oder Checksummen für kritische Daten  

---

## A09: Security Logging and Alerting Failures
- [ ] Logging korrekt (`info`, `warn`, `error`)  
- [ ] Auth-bezogene Events protokolliert  
- [ ] Keine sensiblen Daten in Logs  
- [ ] Alerts konfiguriert für kritische Events  

---

## A10: Mishandling of Exceptional Conditions
- [ ] Try/Catch für kritische Operationen  
- [ ] Standard-Fehlercodes, keine Stacktraces an Client  
- [ ] Rollback bei fehlerhaften Operationen implementiert  

---

**Hinweis:**  
Alle Punkte müssen überprüft werden, bevor der PR gemerged wird. Abweichungen dokumentieren und begründen.
