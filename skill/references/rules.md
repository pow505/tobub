# Platform Rules

Rules are JSON for platform differences; native Skills own business orchestration, and Atoms own browser primitives. Rules do not execute arbitrary JavaScript, manage account lifecycle or implement unbounded business loops. Domain resolution prefers declared routes/actions/extractors, then an explicitly registered DomainExtension; no implicit cross-platform fallback exists.

## Shape and navigation

```json
{
  "platform": "selected-platform-code",
  "version": "1.0.0",
  "meta": { "name": "Example", "baseUrl": "https://example.com", "capabilities": ["navigate", "extract", "interact"] },
  "routes": { "home": { "url": "https://example.com", "waitUntil": "domcontentloaded", "check": { "selector": "body", "timeout": 10000 } } },
  "selectors": { "searchInput": "input[name=q]" },
  "extractors": {},
  "actions": {}
}
```

The complete current Rule, extraction and filter type declarations are included in [sdk-types.md](sdk-types.md), including login/anomaly/location checks and all field/filter operands. Optional top-level fields include schemaVersion (string), hash, signature, loginCheck, anomalyChecks and locationPatterns. Use real platform codes and observed selectors. bootstrap uses routes.home, otherwise meta.baseUrl.

A route can use url or a clicked locator; entityLocatorTemplate supports `${params.id}`. waitUntil is load/domcontentloaded/networkidle. check accepts selector/text/url/networkIdle/delay/timeout. waitForNewPage defaults false; visibilityProbeMs controls the pre-click visibility probe. adapter.navigate takes `{ name, params? }`, with a final optional page context.

selectors maps names to a CSS selector or ordered fallback array. Atom option strings may reference `${selectors.searchInput}`, `${payload.keyword}` or `${config.value}`. Templates permit pure paths only, no expressions/calls; missing values fail. Normal template substitution produces strings, so do not use it for numeric/boolean Atom option fields. repeat has its own validated numeric template handling.

## Extraction

An extractor declares itemSelector and fields, with optional idField, maxItems, perItemTimeout, readiness, readinessPolicy, scan, scrollIntoView, includeErrors, errorPolicy, filter, timeout, dedupe and dedupeFields. adapter.extract(name) returns JSON, never a Locator. Scanning does not scroll/navigate: actions or Skill code own those interactions.

fields use the shared Atom field schema in [capability-catalog.json](capability-catalog.json): name, relative selector, nth, source, many, nested fields, parse, transforms, fallback and required. Sources include text/textContent/html/outerHTML/href/src/exists/count or `{ "attr": "href" }`. parse supports string/json/number/boolean; transforms include trim/normalizeWhitespace/replace/match/prefix/absoluteUrl. Consult exact schemas for transform/filter operands.

idField may be a dotted path including numeric array segments; an exact field name takes priority. dedupe is field/content/none; dedupeFields selects content fingerprint inputs. readinessPolicy defaults break (skip is explicit). scan mode append suits stable appended DOM; rescan is the default for virtualized lists. scope is all/viewport/viewport-buffer; viewportBufferScreens defaults 1.

## Action steps

An action is `{ "steps": [...] }`; each step declares exactly one atom or action. Reused actions inherit payload/config/selectors/Page, accept no new options, cannot cycle and have maximum nesting depth 16. Common fields are when, probability, repeat and onFailure. Atom steps additionally take options and step-level timeout; do not put timeout in Atom options. Action-reference steps have no timeout.

```json
{
  "atom": "fill",
  "options": { "selector": "${selectors.searchInput}", "value": "${payload.keyword}" },
  "timeout": 10000,
  "when": { "path": "payload.enabled", "equals": true },
  "onFailure": { "policy": "throw" }
}
```

probability ranges 0..1, default 1. repeat is an integer 1..100 or `{ "min": 1, "max": 3 }`, bounded to 100; the current type also permits payload-path templates, whose resolved value must satisfy the same bounds. when is reevaluated before each repetition; becoming false ends repetition normally and continues subsequent steps.

onFailure.policy defaults throw. continue records failure and continues; retry uses maxAttempts/delay/backoff and continues after exhaustion. Both continue and exhausted retry leave the overall action unsuccessful; neither converts a failed step to success. Observe ActionResult.success/errorCode, not only absence of a thrown exception.

waitFor.options.delay accepts milliseconds or an inclusive [min,max] range, non-negative and max>=min.

## Conditions

- Payload/config: `{ "path": "payload.enabled", "equals": true }`, with exists/equals/notEquals. Paths start at payload or config.
- Page: selector plus state=exists/visible/hidden (default visible). exists checks count; visibility uses the first element. Optional read and compare must appear together; comparisons scan matching outer elements and succeed if any matches.
- read: optional descendant selector, source=text/textContent/attr (default textContent), attr required for attribute reads, type=string/number/boolean (default string).
- compare.operator: equals/notEquals/gt/gte/lt/lte/contains/startsWith/endsWith, plus value.
- URL: `{ "url": "/items/" }` is substring matching, not regex.
- Compose conditions with nested all/any/not.

A false condition skips a step without failure. Conditions decide whether to run, not which matched element to click. For target filtering use the selected Atom's documented where/visibleOnly fields.

## Check, save, publish and bind

Use the exact Rule HTTP contract in [runtime-api.md](runtime-api.md). Saving a draft permits incomplete structure; it is not proof of runtime validity. Include the draft uuid when editing to reuse it; omission creates a draft. Published current/archived UUIDs are immutable and cannot be changed through save.

Runtime validation checks structure, route/extractor/action/selector types, registered and Rule-allowed Atoms, Atom options, exclusive atom/action, referenced actions, conditions/probability/repeat and any supplied hash. Hash calculation excludes hash and signature. Publishing requires runtime validation, produces an immutable UUID and removes the published draft. The native HTTP endpoint defaults activate_current to true, which archives/replaces platform current. The MCP tool therefore requires an explicit boolean: send `{ "activate_current": false }` to publish an archived snapshot without changing current; true requires an explicit platform-wide change request. Matching platform+version+hash may reuse a snapshot with deduplicated=true. Read actual returned status/UUID instead of predicting it.

A draft cannot be selected. Bind a published Rule snapshot to the requested Skill. Selecting platform current is a separate shared-platform change and requires that user intent. A native Skill's execution rule override takes precedence over an explicit/bound Rule, then platform current. Do not guess semantic action names from another platform.

Source: SDK platform Rule documentation, src/kernel/rule/Rule.type.ts and RuleValidator.ts.
