# DeFlock Safford

A local research and advocacy site on Flock Safety mass surveillance in Graham County, Arizona. A project of The Mnemosyne Research Institute.

Built with Astro 5, matching the house style of the other Mnehmos sites (dark theme, Space Grotesk + Inter, token-driven CSS in a single global Layout).

## Structure

Three sections, organized in the nav as Learn / Local / Act:

**Learn**
- `cameras` — What Flock really is (Vehicle Fingerprint, people-search, Nova, Ring)
- `network` — The national network and its documented abuse, Arizona-first
- `architecture` — Flock to Palantir to Maven, the surveillance-to-targeting chain

**Local**
- `safford` — Fair account of the local sheriff/PD Flock interview, and where it doesn't hold

**Act**
- `records` — Copy-paste A.R.S. § 39-121 public records request for the Flock network audit
- `organize` — How five Arizona communities pushed Flock out

Plus `index` (home) and `about`.

## Sourcing standard

Every factual claim links to a primary document or major news report. Documented facts are kept distinct from predictions. Where a claim rests on advocacy-group analysis rather than a government admission, the page says so. Corrections are welcome and load-bearing — a wrong fact undercuts the whole project.

## Develop

```
cd site
npm install
npm run dev
```

## Build & Deploy

```
npm run build
```

Deploys to GitHub Pages. Set the `base` in `astro.config.mjs` to match the repo name before first deploy (currently `/deflock-safford/`).

## Verification notes (for future edits)

- Maven → Iran: phrase as "used to pick targets in the Iran campaign," NOT "Maven chose the school." The school-strike attribution is an advocacy-group "likely," not a DoD admission.
- Palantir integration: Flock Nova *can* plug into Palantir (documented capability). Do not claim Graham County data currently flows to Palantir — that is not documented.
- Protest tracking: 19 of ~3,900 agencies. Frame as "already aimed," not "tracking every protester everywhere."
- Local: no Flock abuse is documented for Safford PD / Graham County SO. The argument is about the network and the right to audit, not local misconduct.
- Maven contract: started at $480M, has grown into the billions. The exact current figure ($1.3B) traces to a Tier-3 outlet; "into the billions" is the safe phrasing.
