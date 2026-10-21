# Execution status, results and feedback

A successful skill_run response means acceptance. run_id identifies live control/status; session_id identifies persisted execution records and data collections. Neither is interchangeable. browser_open indicates a connected Provider, not successful completion. cancellable becomes false at a terminal state.

The local run state machine is preparing → running → completed, preparing/running → cancelling → cancelled, or failure during execution. Poll skill_run_status and inspect output/error/diagnostics. Terminal records remain in memory briefly; expiry or Runtime restart yields 404. Use skill_history for persisted outcomes; no Worker/browser handle is recovered after restart.

skill_cancel returning cancelled=true means the signal was sent. Continue polling until the terminal state and cleanup are observed. cancelled=false can mean unknown, completed or no longer cancellable and remains an idempotent successful HTTP response. Closing the MCP transport does not cancel Runtime work.

A guest uses execution.agent_id=null and shares fixed Agent slot 0. One Agent runs one Skill at a time; a second request is immediately busy, never queued. Separate authorized Agents can run concurrently, subject also to Profile leases. HTTP and local schedules use the same slot rules. Additional Agent authorization is Runtime-owned; this package needs no Cloud account for guest execution.

Runtime UI receives execution_event, task_status and log independently. connected is only connection acknowledgement. Execution events carry schema_version, execution_id, task_id, agent_id, skill_id, sequence, source, action, phase, severity and display feedback. Consumers use stable error.code for logic; feedback text is presentation. origin=propagated may collapse duplicate logs but does not remove events.

REPORTER_PERSIST_ENABLED=false disables event persistence only. Persistence failure does not change the Skill result. Atoms/domain operations emit their own events; reporter.emit supplements business progress. debug.log sends temporary, bounded/redacted UI diagnostics, with no persistence or Cloud forwarding; without a connected UI those logs can be lost.

Schedules derive platform from the saved Skill, validate cron/identity configuration on save, use APP_TIMEZONE and return UTC ISO-8601 times. A schedule cannot overlap itself. Config merges after defaults and saved execution settings. The desktop Runtime must remain running. The Agent bridge requires `body.skill_id` on schedule create and update to verify the saved Skill is local. For an update, include the existing Skill ID when it is unchanged; send only changed values for the other fields. The native HTTP update contract itself remains partial.

Source: SDK execution feedback documentation and docs/api.md.
