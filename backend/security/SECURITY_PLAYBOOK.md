# Carsharing App – OWASP Top 10 Security Playbook (2025)

## Zweck
Dieses Playbook definiert Security-Regeln für die "Esuap" Webanwendung basierend auf der **OWASP Top 10 2025**.  
Es wird bei **jedem Feature-Change**, **API-Change** oder **Release** angewendet, um reproduzierbare Sicherheitsprüfungen sicherzustellen.

---

## 1. Architektur & Annahmen
- **Webanwendung**: NestJS Backend, GraphQL (Mercurius), Prisma, PostgreSQL  
- **Projektstruktur**: Backend enthält Auth-Service, API-Layer, Fachlogik (User, Trip, Vehicle, Rating)  
- **Auth**: JWT mit GraphQL AuthGuard, Passwörter gehasht via bcrypt  
- **Logging**: Typisierte Log-Ereignisse (`info`, `query`, `warn`, `error`)  
- **Rollen**: `user`, `driver`, `passenger` (CRUD, Passwort-Update)  

**Kritische Assets:** Auth Tokens, Userdaten  

---

## 2. Anwendungshinweise
- **Trigger:** Neue Features, API-Änderungen, Rollenanpassungen  
- **Pflicht:** Vor jedem Merge / Release prüfen  
- **Dokumentation:** Abweichungen müssen begründet und freigegeben werden  

---

## 3. OWASP Top 10 – 2025 Playbook

### A01:2025 – Broken Access Control
**Risiko:** Unbefugter Zugriff auf APIs oder Fahrzeugsteuerung  
**Trigger:** Neue API-Route, neue Rollen, Feature mit Objekt-IDs  

**Pflicht-Checks:**  
- Serverseitige Autorisierung für jede Route  
- Ownership validiert (`user.id === resource.ownerId`)  
- Keine Abhängigkeit auf Client-Checks  

**Maßnahmen:**  
- Release-Blocker  
- Zentralisierte Authorization-Logik implementieren  
- Security Review  

---

### A02:2025 – Security Misconfiguration
**Risiko:** Fehlende Sicherheitsstandards, z. B. ungesicherte GraphQL-Endpunkte  
**Trigger:** Deployment, neue Umgebungen, neue Services 

**Pflicht-Checks:**  
- `.env` nicht versionieren, nur `.env.example`  
- GraphQL Playground nur in Dev-Umgebung  
- Security Headers setzen (CSP, HSTS, CORS)  

**Maßnahmen:**  
- Release-Blocker bei fehlender Konfiguration  
- Review vor Deployment  

---

### A03:2025 – Software Supply Chain Failures
**Risiko:** Externe Pakete enthalten Schwachstellen  
**Trigger:** Dependency-Updates, neue Pakete  

**Pflicht-Checks:**  
- `npm audit` / `yarn audit` durchführen  
- Sicherheitsupdates sofort einspielen  
- Keine ungeprüften externen Packages  

**Maßnahmen:**  
- Merge nur nach Audit  

---

### A04:2025 – Cryptographic Failures
**Risiko:** Passwort- oder Tokendiebstahl, schwache Hashes  
**Trigger:** Änderungen an Auth, Passwort-Handling, Token-Logik  

**Pflicht-Checks:**  
- Passwort-Hashing via bcrypt ≥ 12 Salt-Rounds  
- JWT-Signatur geheim halten, kein Hardcoding  
- TLS für Transport  
- Sensible Daten niemals im Klartext speichern 

**Maßnahmen:**  
- Schwache Hashes erhöhen  
- Secrets nicht im Repo speichern  
- Security Review  

---

### A05:2025 – Injection
**Risiko:** SQL/GraphQL Injection über unsicheres Prisma/GraphQL-Input  
**Trigger:** Änderungen an Queries, neuen Endpoints, User-Input  

**Pflicht-Checks:**  
- Prisma Queries parametrisiert nutzen  
- Keine dynamischen Strings in GraphQL-Resolvern  
- Input validieren (Whitelist/Pattern)  

**Maßnahmen:**  
- Block Merge bei unsicherem Query  
- Security Review  

---

### A06:2025 – Insecure Design
**Risiko:** Fehlende Sicherheitskontrollen bei neuen Features 
**Trigger:** Neue Features, Architekturanpassungen  

**Pflicht-Checks:**  
- Threat Modeling vor Feature  
- Security Review  
- Autorisierungsregeln von Anfang an implementieren  

**Maßnahmen:**  
- Design-Review  
- Feature nur nach Security-Freigabe  

---

### A07:2025 – Authentication Failures
**Risiko:** JWT-Diebstahl, schwache Authentifizierung  
**Trigger:** Änderungen an Auth-Service, Token-Handling, Passwort-Update  

**Pflicht-Checks:**  
- JWT Ablaufzeiten korrekt setzen  
- Refresh Tokens sicher implementieren  
- Rate-Limits auf Login/Reset  
- Multi-Factor optional für Admins  

**Maßnahmen:**  
- Release-Blocker bei kritischen Schwächen  
- Security Review  

---

### A08:2025 – Software or Data Integrity Failures
**Risiko:** Manipulation von Daten (Trips, Userdaten)  
**Trigger:** Änderungen an Prisma-Schema, API-Resolver, Upload-Funktion 

**Pflicht-Checks:**  
- Input-Validierung  
- Keine ungesicherten Datei-Uploads  
- Hashes oder Checksummen für kritische Daten  

**Maßnahmen:**  
- Merge-Block bei fehlender Integritätskontrolle  
- Review durch Team  

---

### A09:2025 – Security Logging and Alerting Failures
**Risiko:** Sicherheitsrelevante Aktionen nicht nachvollziehbar  
**Trigger:** Änderungen an Logging oder kritischen Endpoints  

**Pflicht-Checks:**  
- Log-Level korrekt setzen (`info`, `warn`, `error`)  
- Auth-bezogene Events protokollieren (Login, Token-Refresh, Role Change)  
- Logs enthalten keine sensiblen Daten  

**Maßnahmen:**  
- Logging-Review  
- Alerts konfigurieren für kritische Events  

---

### A10:2025 – Mishandling of Exceptional Conditions
**Risiko:** Fehler oder Ausnahmen führen zu unkontrolliertem Verhalten (z. B. Absturz, Datenverlust)  
**Trigger:** Fehlerbehandlung an neuen oder geänderten Endpoints 

**Pflicht-Checks:**  
- Try/Catch für kritische Operationen  
- Standard-Fehlercodes, keine Stacktraces an Client  
- Sensible Aktionen rollbacken bei Fehler  

**Maßnahmen:**  
- Review von Error-Handling  
- Merge nur nach Test der Exception-Szenarien  

---

## 4. Reproduzierbarkeit
- Jede Kategorie hat **Trigger → Checks → Maßnahmen**  
- Für **jedes Feature/Release** wiederholbar  
- Deckt **aktuelle und zukünftige Features** ab  
- Entwickler müssen **keinen Code sehen**, nur Playbook anwenden  

---

## 5. Anwendung
| Aktivität | Prüfpunkte |
|------------|------------|
| Neue API-Routen | A01 + A05 + A06 |
| Auth / Token Änderungen | A04 + A07 |
| Logging | A09 |
| Exception Handling | A10 |
| Dependency Updates | A03 |
| Deployment / Konfiguration | A02 |
| Integrität von Daten / Uploads | A08 |

- Abweichungen dokumentieren und freigeben  
- Merge / Release nur nach erfolgreicher Anwendung des Playbooks  

---

