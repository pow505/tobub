# Discover: bounded exploration

Discover completes one unknown goal and preserves an auditable process plus reusable page knowledge. A native Skill expresses a known repeatable workflow. Their lifecycles are separate.

Session owns goal, environment, policy, budget and current Run. Run kind is explore, with immutable execution configuration/checkpoints. Events are ordered evidence; the only artifact kind is exploration_result, schema_version=1. Artifact claims must bind to persisted events/assets. Page knowledge informs future exploration and is not a Skill definition.

Create a workspace, then start a Run using the exact documented expected_session_version and idempotency_key. Poll Run status and handle waiting/input/approval/pause/takeover states from actual responses. Set explicit step/time/token budgets appropriate to the goal. Resume uses fresh observation. Budget extension and workspace maintenance routes outside this bridge's allowlist must not be invented as tool names.

Approvals identify the exact pending action_hash and remain tied to the current page/context. Approve only the action the user authorized. Human takeover/release uses request_id. Business input is non-sensitive; credentials remain human-controlled. The Runtime's auto_safe policy preserves approval for cross-site, sensitive, high-risk or irreversible actions. Explicit full_auto skips the approval pause while retaining argument, upload allowlist, URL, capability and authorization checks; it must reflect the user's selected policy.

Runtime chooses DOM or Vision observation based on page evidence, page knowledge, goal and risk policy. DOM is not an absolute priority. Vision may be selected directly or used after insufficient DOM/action failure. Planner context uses bounded evidence indexes; complete evidence stays persisted. process_summary is computed from actual events: observations, Vision observations, Planner decisions, actions, macros, successes, Skill calls and actual Vision fallbacks. Suppressed screenshots do not count as a fallback; Planner cannot fabricate these metrics.

Discover may invoke existing Skills through a gateway that validates schema, declaration fingerprint, merged defaults, identity, capability/risk and remaining budget. Definition/context changes invalidate approval. Execution still goes through ExecutionEngine. Runtime shutdown aborts and waits for active browser Runs before kernel shutdown.

Discover never creates, validates, repairs or publishes a Skill. A separate explicit authoring request may select bounded evidence from one completed Run, including its own events and exploration_result only. This one-way reuse neither changes Discover nor implicitly injects an entire workspace.

Default URL policy rejects credentials, loopback, link-local, metadata and private IP literals. A controlled intranet deployment can explicitly set AUTHORING_ALLOW_PRIVATE_NETWORK=true; URL policy remains active in every approval mode. Do not change this configuration to bypass a failed task.

Source: SDK docs/Discover.md and docs/skill.md.
