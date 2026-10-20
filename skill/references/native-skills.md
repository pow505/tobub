# Native Skills: execution and composition

Use [authoring.md](authoring.md) for save/package formats and [capability-catalog.json](capability-catalog.json) for exact callable signatures, option schemas and examples. This guide describes lifecycle rules from SDK `docs/skill.md`; it does not expose host implementation classes as Skill APIs.

## Code, parameters and ownership

Native Skill code is plain JavaScript with a top-level return. `tobub.params` contains business inputs, validated by `input_schema`; the JSON-compatible return is validated by `output_schema`. `ui_schema` renders inputs and does not set execution defaults. HTTP save bodies and internal definitions differ in casing; preserve JSON Schema and user parameter keys.

The sandbox provides pure `URL`, `URLSearchParams`, `TextEncoder` and `TextDecoder`. Network, files, processes and timers use their declared `tobub` capabilities. Node imports, global fetch and host Playwright objects are not directly exposed. `atoms.evaluate` is a controlled exception: page JavaScript is the default scope; explicit `scope: 'playwright'` executes serializable function source against the main-thread Page. Its return must cross the Worker serialization boundary. Read the exact Atom contract before using it.

`atoms` perform individual browser actions. Their first argument carries business options; the second carries `{ page, timeout, retry, onError, remark }`. Do not put shared timeout in business options. Supported scalar conveniences include navigate(url), click(selector), hover(selector), fill(selector, value), clipboardWrite(text), waitFor(delay) and waitFor([min,max]). `utils.randInt(max)` and `randInt(min,max)` use an exclusive upper bound. Atom waitFor delay ranges include both endpoints.

`execution.sessionId` is created and finalized by Runtime. DB capabilities bind agent, session, Skill, platform and account ownership; code cannot override those fields. `db.initSessionFromMeta`/`endSession` apply only when the business flow needs an additional independent session. `tobub.account` is read-only business identity; Profile authentication files remain Runtime-owned.

## Browser pages, forms and media

`browser.current/pages/open/close/bringToFront` exchange JSON PageRef objects. Opening a page does not change the default page. Use an Atom's second argument `{ page }`, or the last argument of adapter.navigate/action/extract, to select a page. Runtime reclaims pages created by this execution; child flows must not close a parent's main page, Context or Provider.

`fill` defaults to sequential keyboard events. Use explicit `inputMode: 'direct'` only when direct assignment fits the page. `upload` accepts one file path or an array supplied through this run's declared input parameters; it does not perform submission or wait for server processing. Recording compiles upload input into `params.inputPath`/`inputPaths`, never an embedded machine path. Form sequencing uses the normal fill/select/click/press/upload primitives.

Clipboard primitives operate on the current browser Context's plain-text clipboard, not the host system clipboard. copy/cut with a target select that target's contents by default; without a target they act on the current selection. paste retains native browser paste events; omit value to use existing browser clipboard content. Use press for other keyboard combinations.

Screenshot element targeting uses `{ target: { role: 'button', name: 'Submit' }, name: 'submit' }`; the outer name is an output filename. Omit target for a page screenshot. `output: 'base64'` captures the current viewport, includes CSS-pixel width/height and limits the original image to 700 KB. Re-observe after page changes before using image coordinates.

`browser.events` handles popup/download/dialog/console events; `browser.network` watches, collects and routes browser traffic. Routing supports continue/abort/fulfill. `net` makes active Worker HTTP/WebSocket requests and is separate from browser traffic observation. Release handles owned by the current flow.

`browser.media` controls browser audio/video, accepts URLs, Runtime/AI asset references or page targets, and never exposes a local media path. play is a convenience; open returns a lifecycle reference. pause/stop/seek/state/wait/close use that reference. wait defaults to ended with a 30-second timeout. Control operations for one reference are serialized; business code owns ordering, deduplication and any queue.

## Composition

Only `skills.invoke` and `skills.invokeCurrent` compose native Skills. Runtime resolves the child declaration, validates IO and requirements, enforces call depth/cycle detection, and shares cancellation/deadline tracking through its existing executor.

```js
const result = await tobub.skills.invoke({
  skillId: 'selected-child-id',
  params: {},
  environmentMode: 'auto',
  pageMode: 'new',
  timeout: 30000,
  onError: 'throw'
});
```

Child configuration merges defaults, saved execution config, then explicit invocation params/browser/execution. Native invocation properties use camelCase. With auto/new (the default), the same platform, identity and compatible browser plan reuse the parent Context and open a new Page; other identities/platforms use an isolated Provider and Profile lease. An explicit incompatible reuse fails with `browser_environment_conflict`. Attempting isolation against the parent's already-held Profile fails with `browser_profile_busy` rather than waiting on its own lease.

`invokeCurrent({ skillId, params?, timeout?, onError? })` fixes environmentMode=inherit and pageMode=current. It accepts no browser/execution/pageMode overrides, reads no child Profile cookies and acquires no new Profile lease. Across platforms, it does not rebind the parent's account to the child platform. Child-created pages/listeners/routes are cleaned; the parent's primary page and environment remain owned by the parent.

Independent child cleanup stops the Worker, tears down execution, saves successful light Profile state, cleans child resources, closes the Provider and releases its lease. A release error is recorded as `browser_environment_release_failed` without replacing the child's original business result. Other stable routing errors include `browser_identity_required`, `browser_environment_plan_failed`, `browser_environment_launch_failed` and `child_skill_account_conflict`.

## Data, observation and monitoring

`data.open` defaults to event mode: omitted outputs use JSONL for events and database storage for entities. Supply policy.maxRecords or policy.maxBytes even when accepting other defaults. The catalog defines output formats, filters, transforms, deduplication and collection policies. HTTP collection tools use execution session IDs and bounded pagination.

`monitor.watch(callback, options?)` runs sequentially in the foreground. `monitor.start` returns `{ status, stop(), wait() }` for bounded background work in the same Skill. Defaults: intervalMs=30000, immediate=true, fixed-delay, onError=throw, no retry. Explicit intervalMs must be an integer from 100 through MAX_TIMER_DELAY_MS. Retry maxAttempts counts total attempts, not additional retries. fixed-rate skips missed periods and never overlaps callbacks; fixed-delay measures from callback completion.

The callback receives `{ iteration, attempt, signal, stop }`. Stop or cancellation ends waits/retries/future cycles. A background monitor stops when the Skill returns; an unobserved background failure still fails the Skill. Set finite maxRuns or an explicit business stop condition within the run deadline. Runtime caps normalized events at 2000 per execution (`execution_event_limit`). Monitoring itself does not collect, compare, deduplicate or persist business state.

If `observe.next()` returns status.state=failed, the observation source has failed; later reads reject with `observation_failed`. End that monitor instead of polling a dead source.

## AI and authoring evidence

The catalog includes public chat/chatStream/generateObject/ocr/locateObjects/generateImage/generateSpeech/transcribe/embed/invoke contracts. Read live runtime_capabilities for exact versioned input/output schemas. Declare `requirements.ai` with contractVersion, exact methods, capabilities and dataPolicy. `invoke` is not wildcard permission: declare the registered namespaced extension method. providerKinds, when present, are enforced.

`dataPolicy: 'local-only'` requires a local execution source and a loopback Provider endpoint. LAN/private/public endpoints count as external. Corresponding local AI Scene Profiles must be configured; absent or mismatched capabilities fail explicitly. Model/provider credentials and Scene configuration never belong in a native Skill package. Tobub Cloud is not required; a configured external AI provider may receive supplied data.

OCR and object location return model estimates with normalized 0..1 bounds, not calibrated detector coordinates. Multiply centers by the width/height of the same viewport image before clickAt. Re-observe after changes or occlusion. Pixel-unit Provider coordinates are rejected, not guessed or rescaled.

Recording start/get/pause/resume/stop/cancel/compile collect explicit demonstration evidence. Compile is deterministic and returns an editable candidate without saving or requiring AI. Optional skill_author_proposal uses a configured AI scene and also does not save. Discover evidence must be explicitly selected from one completed Run; selected events/artifacts must belong to that Run. Discover does not itself generate or publish a Skill.
