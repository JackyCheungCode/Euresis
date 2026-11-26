# Euresis Product Architecture

Status: V1.0 — approved product taxonomy for the demonstration catalogue.

## 1. Brand hierarchy

Euresis product discovery has a shared product taxonomy and two independent entry paths:

1. **Manufacturing type:** FORGED or CAST; shared by both paths.
2. **Discovery path:** Vehicle First or Specification First.
3. **Collection:** APEX, GT, SPRINT, ENDURANCE, RALLY or HERITAGE; applies to Specification First only.
4. **Product model:** an individual design name such as VECTOR, MONZA or STRIKE.

Manufacturing type is a product classification, not a collection. Collection names express design positioning and may exist under either manufacturing type when an actual product is developed for that combination.

## 2. Manufacturing identifiers

| Display name | Identifier | Meaning |
|---|---|---|
| FORGED | F | Forged wheel manufacturing |
| CAST | C | Cast wheel manufacturing |

Do not infer manufacturing method from appearance. The manufacturing identifier must be supported by the actual product specification.

## 3. Six collections

| Collection | Positioning | Design direction |
|---|---|---|
| APEX | Track Performance | Track-inspired geometry and lightweight-oriented design |
| GT | Grand Touring | Refined proportions and premium sporting character |
| SPRINT | Street Sport | Direct, contemporary street-sport design |
| ENDURANCE | Performance Engineering | Structural expression and endurance-inspired design |
| RALLY | Adventure Performance | Robust visual character for utility and off-road applications |
| HERITAGE | Classic Motorsport | Classic motorsport references and timeless proportions |

These are brand design directions, not technical performance claims.

## 4. Collection suffix convention

The manufacturing suffix follows the collection name:

- APEX-F, GT-F, SPRINT-F, ENDURANCE-F, RALLY-F, HERITAGE-F
- APEX-C, GT-C, SPRINT-C, ENDURANCE-C, RALLY-C, HERITAGE-C

Only publish a combination when a real or clearly labelled sample model exists. Do not create empty collection pages merely to fill the taxonomy.

## 5. Public product naming

Recommended display structure:

**EURESIS [COLLECTION]-[F|C] [MODEL NAME]**

Examples:
- EURESIS GT-F VECTOR
- EURESIS GT-C VECTOR
- EURESIS APEX-F MONZA
- EURESIS SPRINT-C STRIKE

Model names in the current demo are provisional creative names and have not been trademark-cleared.

## 6. Internal model code

Recommended internal code:

`[MANUFACTURING]-[COLLECTION]-[MODEL ABBREVIATION]-[SEQUENCE]`

Examples:
- F-GT-VEC-001
- C-GT-VEC-001
- F-AP-MON-001
- C-SP-STR-001

Internal codes are identifiers, not customer-facing headlines. Product variants such as diameter, width, offset and finish should be stored as structured variant data rather than appended to the collection name.

## 7. Product data model

Each product record should include:

- slug
- model name and internal model code
- manufacturing type
- collection
- design description
- verified technical specifications
- diameter / width / offset / PCD / center bore where available
- finish options
- load rating where verified
- image assets and source / licence metadata
- fitment records with explicit verification state
- product status: SAMPLE, ACTIVE or DISCONTINUED

Prices and inventory are omitted from the initial enquiry-led catalogue.

## 8. Sample catalogue rules

The first demonstration catalogue contains eight sample concepts. All are labelled SAMPLE / DEMO. Product imagery is reference photography and does not represent actual Euresis production models.

Reference images are served from Pexels and each product record links to its source page and photographer credit. Before any commercial production release, verify current image licence terms and replace reference imagery with Euresis-owned, commissioned or otherwise properly licensed product photography.

Do not describe sample dimensions as confirmed manufacturing specifications. Diameter ranges and finish counts in this demo are editorial placeholders only.

## 9. Fitment rules

Vehicle selector values in the demo are sample entries. They do not establish vehicle compatibility.

Fitment states:
- VERIFIED: supported by validated product and vehicle data.
- REQUIRES_CONFIRMATION: needs technical review.
- NO_MATCHING_DATA: no validated record exists.

The current sample catalogue must never display VERIFIED fitment.

## 10. Product discovery interaction model

Manufacturing type is the shared top-level condition for both discovery paths. After choosing FORGED or CAST, visitors can use either path independently:

- **Vehicle First:** select market, make, model, year and modification; retrieve OE and optional fitment; transfer a chosen fitment into editable wheel-parameter filters; continue refining by diameter, width, PCD and offset. Collection is not required.
- **Specification First:** select a collection and wheel parameters directly. Vehicle make/model/year/modification is never required.

Both paths converge on the same Euresis Wheels Catalogue and product detail pages. Moving between paths must not force a reset of the shared manufacturing condition or require completing the other path.

A vehicle-derived specification is a search criterion, not proof that a sample Euresis product fits the vehicle. Only product-level, validated technical records may support a VERIFIED fitment claim. Missing sample specifications must remain unknown rather than being inferred.

## 11. URL convention

- `/wheels`
- `/wheels/forged`
- `/wheels/cast`
- `/wheels/forged/gt`
- `/wheels/cast/gt`
- `/wheels/[product-slug]`

The initial implementation uses product slugs for detail routes. Category landing routes may be added as the catalogue expands.

## 12. Enquiry conversion

The initial website is enquiry-led:
- no cart
- no checkout
- no online payment
- no invented pricing or stock status

The current inquiry form is a local demonstration only and does not transmit or store submitted personal data. A server-side enquiry endpoint and privacy handling must be implemented before accepting real customer requests.
