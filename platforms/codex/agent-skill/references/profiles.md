# Profiles and execution identity

Account is platform business identity. Profile is reusable browser identity, storage and environment. ProfileAccountBinding records their relationship, authentication status and default choice. Creating an account does not create a Profile; a Skill owns neither asset.

- light: fixed Cloak seed and storageState.
- archive: fixed seed and persistent userDataDir, retaining the full browser environment.
- transient: one-run environment; no Profile/cookie writeback.

HTTP places profile_id only in browser, account_id and agent_id in execution:

```json
{
  "browser": { "run_mode": "profile", "profile_id": "selected-profile", "auth_mode": "inherit" },
  "execution": { "account_id": 1, "agent_id": null }
}
```

Use actual identifiers from the current Runtime. Account IDs are positive integers; Profile IDs are strings. The example ID 1 is illustrative, not an account selection. For light, profile+inherit requires a valid authenticated account binding; successful execution updates stored authentication. light+none skips serialized authentication and does not write it back. For archive, the persistent Context always retains and writes the entire userDataDir: auth_mode=none does not strip existing login state. Account is optional for archive; when specified, its binding is validated.

Transient can be anonymous or borrow valid light authentication without writeback; archive is not a transient authentication source. Profile environment settings (UA, language, timezone, viewport, fingerprint) belong to the Profile/execution plan. A Skill cannot override a selected Profile's identity settings. Browser proxy is the separate execution-level control described by the run contract.

Execution, recording and Profile maintenance share the same exclusive Profile lease. Agent slots are a separate concurrency constraint; an available Agent does not make an occupied Profile available. Independent HTTP runs have independent Contexts. Normal composition follows [native-skills.md](native-skills.md): compatible same-identity auto calls reuse Context/new Page; invokeCurrent reuses the primary page and never reloads a child's Profile cookies.

## Record and verify a login in the desktop UI

The Runtime MCP bridge can inspect account/Profile summaries, but it does not expose Profile login-recording endpoints. When a site requires a login and the matching binding is absent or not valid, ask the user to record it in Tobub before running the Skill:

1. Open **Settings → Browser Profiles** (`/setting/profiles`) and select the intended Profile. Use **Manage accounts** to confirm the correct existing platform account is bound; add that account to the Profile only if the user has requested or approved the identity setup.
2. On that account row, choose **Record login state**. Enter the site's HTTP(S) start URL and choose **Start recording**. Tobub opens the Profile's visible browser.
3. The user signs in there and reaches a page that proves the intended account is authenticated. Return to the dialog, choose **Confirm capture**, then **Save to storage**. Closing the recording dialog before saving cancels the active recording.
4. Use the UI's **Validate** action when available. Also re-read `tobub_account_list` and confirm the intended platform/account has an active `profile_contexts` entry with the exact `profile_id` and `auth_status: "valid"`; use `tobub_profile_list` to confirm the Profile itself is active. Never infer validity merely from a successful capture or an account/Profile name.

When authoring in Tobub's UI, the Skill system configuration can select the account and Profile. In agent-generated save bodies, keep identifiers out of the reusable code: declare the appropriate account/Profile requirements, and pass the user's selected `execution.account_id` plus `browser.run_mode: "profile"`, `browser.profile_id` and `browser.auth_mode: "inherit"` at run time. An archive Profile retains its full persistent browser directory; `auth_mode: "none"` does not erase existing login state. A one-run human takeover is not a saved Profile login and must not be represented as one.

A failed binding or occupied lease is not a reason to reset, delete or silently rebind identity assets.

Source: SDK Profile design documentation.
