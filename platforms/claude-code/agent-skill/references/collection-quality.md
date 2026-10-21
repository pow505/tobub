# Collection scope, completeness and saved output

Use this reference when a Skill collects repeated records such as comments, replies, posts, products, search results or message history. It describes a verification method, not a promise that a site exposes complete data.

## Define the requested set

Before writing selectors, state what one record means and what belongs in scope: for example, top-level comments plus every reply, including nested reply levels; a date range; selected sort order; or only records visible to a specific account. Record the platform, target URL, required Account/Profile and relevant filters. Login state can change both the page and its totals, so confirm the intended authenticated context before measuring the target set.

Identify a trustworthy completion signal from the live site:

- an exact total with clear scope and units;
- a terminal page/end marker after every continuation has been followed; or
- another site-specific condition that proves the requested scope is exhausted.

Treat rounded, sampled, filtered, hidden-by-permission, or otherwise ambiguous totals as estimates. A missing continuation control on the current viewport does not prove that an infinite-scroll list is exhausted.

## Observe and traverse the live Runtime page

Run browser-based authoring or validation visibly. Inspect the page Tobub actually controls. A separate browser's accessibility tree or DOM snapshot is only a hypothesis; it may expose hidden controls or roles that Tobub's page does not match.

Verify that each locator matches the intended current-page elements, that the elements belong to the requested scope, and that they are visible or otherwise intentionally extractable. `extractList` iterates all nodes matched by `itemSelector`, including hidden DOM nodes; it does not apply an implicit visibility filter. Re-observe after navigation, opening a menu, changing sort/filter, expanding replies or changing locale. Derive button text patterns from the live UI, including singular, plural and localized forms.

For pagination, load every page and verify that page identity or stable record IDs advance. For infinite scroll or virtualized lists, extract each newly loaded window before it is replaced, deduplicate by stable source ID and stop only after an observed terminal condition or a bounded no-progress rule. For threaded content, expand every reply level in scope and verify the expected children appeared before extracting them. Keep maximum pages, expansion attempts, records, bytes and duration finite. If the site stops responding or progress stalls before the completion signal, return a partial result with the reason.

## Extract and preserve relationships

Use a stable source ID when the page exposes one. Store parent/thread IDs for replies so the hierarchy can be checked after deduplication. Do not use an array position or mutable display text as a supposedly stable ID. If no stable ID exists, define and disclose a composite deduplication key and its collision risk.

Keep extraction failures visible. Check `failedCount`, `duplicateCount`, missing IDs, malformed required fields and orphan replies. Decide explicitly whether an empty set is valid; branch before `extractList` when no matching items is a valid outcome because the Atom waits for a matching node. Do not convert a failed or timed-out extraction into a successful empty result.

Set `maxItems` and `tobub.data.save` policy limits deliberately. Align record and byte budgets with the task, and treat any reached limit, failed output or dropped record as partial. Do not save more than was requested simply to make a count match.

## Verify completion and persistence

Mark the collection **complete** only when the requested scope has a verified terminal condition, extraction had no unresolved failures, all required records are present after deduplication, parent references are valid, and persistence is confirmed. A known exact total should match the unique collected records. When only traversal exhaustion is available, report that basis and its scope; never claim a site-wide total the page did not establish. Otherwise use **partial** or **not confirmed** and state the evidence that is missing.

After the Skill reaches a terminal Run state:

1. Inspect the actual output and compare expected, extracted and unique counts. Include top-level/reply counts and the completion basis when relevant.
2. Read the session's data-collection manifest and paginated records through `tobub_data_records`. Check collection status, each output status, manifest `record_count`, returned page totals and the output file's actual row count. Follow every records page when the collection exceeds one response page.
3. Report separately the number of records observed, successfully extracted, deduplicated and persisted. Include failed, skipped, orphaned or capped counts where applicable. Do not treat a completed Run alone as proof that every requested record was saved.

## Validate the workflow before relying on it

Use a controlled page fixture to exercise the behavior the site presents: zero valid results, one and multiple replies, localized labels, nested levels when they exist, repeated DOM renderings, missing/duplicate IDs, extraction failures, pagination or scroll termination, and a record/byte limit. Assert both the returned status/counts and the saved manifest/records. A fixture validates the Skill logic; it does not verify a live site's selectors, authentication or data completeness.
