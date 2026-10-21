# SDK capability types

Generated from the actual SDK type checker. Use these declarations to understand catalog signatures; never import host SDK modules into a native Skill. Only methods listed in capability-catalog.json are exposed to Skills. Host-only DomainAdapterHost/Playwright members are not Skill APIs. Runtime binds DB execution ownership; do not override agent/account/session/Skill identity fields.

## src/adapters/persistence/sqlite/dao/AccountDao.ts

```ts
export interface ListAccountsParams {
    platformId?: number | undefined;
    includeInactive?: boolean | undefined;
    limit?: number;
    offset?: number;
}
```

## src/adapters/persistence/sqlite/dao/ActionDao.ts

```ts
export interface ListActionsParams {
    agentId?: string | null | undefined;
    accountId?: number | undefined;
    platform?: string | undefined;
    platformId?: number | undefined;
    skillId?: string | undefined;
    sessionId?: number | undefined;
    observationId?: number | undefined;
    contentItemId?: number | undefined;
    actionTypeId?: number | undefined;
    actionTypeCode?: string | undefined;
    status?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}

export interface ActionWithCodes extends ActionRow {
    action_code: string;
    action_name: string;
    platform_code: string;
    platform_name: string;
}
```

## src/adapters/persistence/sqlite/dao/ContentDao.ts

```ts
export interface ListContentsParams {
    observationIds?: number[] | undefined;
    platform?: string | undefined;
    platformId?: number | undefined;
    contentType?: string | undefined;
    externalId?: string | undefined;
    parentId?: number | undefined;
    keyword?: string | undefined;
    sessionId?: number | null | undefined;
    accountId?: number | undefined;
    agentId?: string | null | undefined;
    skillId?: string | undefined;
    source?: string | undefined;
    observationSource?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}

export type ContentWithQueryMeta = ContentObservationWithItemRow;

export interface CreateContentObservationInput {
    contentItemId: number;
    platform?: string | undefined;
    platformId?: number | undefined;
    sessionId?: number | null | undefined;
    accountId?: number | null | undefined;
    agentId?: string | null | undefined;
    skillId?: string | null | undefined;
    skillName?: string | null | undefined;
    source?: string | undefined;
    actionTypeCode?: string | null | undefined;
    metadata?: Record<string, unknown> | undefined;
    displayPath?: string | null | undefined;
    sortOrder?: number | undefined;
}

export type ContentOptionKind = 'platform' | 'content_type' | 'agent' | 'session';
```

## src/adapters/persistence/sqlite/dao/PlatformDao.ts

```ts
export interface DeletePlatformResult {
    found: boolean;
    deleted: boolean;
    blockers: string[];
}

export interface ListPlatformsParams {
    limit?: number;
    offset?: number;
    domain?: string;
}
```

## src/adapters/persistence/sqlite/dao/ReportDao.ts

```ts
export interface ListReportsParams {
    agentId?: string | null | undefined;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}
```

## src/adapters/persistence/sqlite/dao/SessionDao.ts

```ts
export interface ListSessionsParams {
    agentId?: string | null | undefined;
    accountId?: number | undefined;
    platform?: string | undefined;
    platformId?: number | undefined;
    skillId?: string | undefined;
    status?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}

export interface StartSessionInput {
    sessionKey?: string | null | undefined;
    agentId?: string | null | undefined;
    skillId?: string | null | undefined;
    skillName?: string | null | undefined;
    platform?: string | null | undefined;
    platformId?: number | null | undefined;
    ruleUuid?: string | null | undefined;
    ruleVersion?: string | null | undefined;
    accountId?: number | null | undefined;
    params?: Record<string, unknown> | undefined;
}

export interface SessionCleanupOptions {
    includeEmptyData?: boolean | undefined;
}

export interface SessionDeletionOptions {
    preserveCollectedContent?: boolean | undefined;
}
```

## src/adapters/persistence/sqlite/dao/StatisticsDao.ts

```ts
export interface ListStatsParams {
    agentId?: string | null | undefined;
    skillId?: string | undefined;
    platform?: string | undefined;
    platformId?: number | undefined;
    accountId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    limit?: number;
    offset?: number;
}

export interface StatsScope {
    agentId?: string | null | undefined;
    skillId?: string | null | undefined;
    platform?: string | null | undefined;
    platformId?: number | null | undefined;
    accountId?: number | null | undefined;
}

export interface StatsDelta {
    sessionDelta?: number;
    contentDelta?: number;
    newContentDelta?: number;
    actionDelta?: number;
    actionTypeCode?: string | undefined;
    extra?: Record<string, unknown>;
}

export interface ResolvedStatsScope {
    agentId: string | null;
    skillId: string | null;
    platform: string | null;
    accountId: number | null;
}
```

## src/kernel/domain/Domain.type.ts

```ts
export interface DomainAdapter {
    readonly platform: string;
    readonly version: string;
    bootstrap(opts?: unknown): Promise<void>;
    authenticate(creds: unknown): Promise<unknown>;
    isLogin(): Promise<boolean>;
    navigate(target: NavTarget | string, params?: Record<string, string>): Promise<unknown>;
    getCurrentLocation(): Promise<unknown>;
    action(type: unknown, payload?: unknown): Promise<unknown>;
    detectAnomaly(): Promise<unknown>;
    getMetadata(): unknown;
    getPlatformCapabilities(): Promise<unknown>;
    dismissPopups(): Promise<unknown>;
    extract(name: string, options?: DataExtractionRequest): Promise<unknown>;
    resetExtractor(name?: string): unknown;
    getExtractorSeenCount(name: string): number;
    getRuleMeta(): unknown;
    getSelector(name: string): string | string[];
}

export interface DomainAdapterHost extends DomainAdapter {
    getData(name: string, options?: DataExtractorOptions): unknown;
    navigateOnPage(page: Page, target: NavTarget | string, params?: Record<string, string>): Promise<unknown>;
    actionOnPage(page: Page, type: unknown, payload?: unknown): Promise<unknown>;
    extractOnPage(page: Page, name: string, options?: DataExtractionRequest): Promise<unknown>;
}

export interface DataExtractorOptions {
    params?: Record<string, unknown>;
    scan?: {
        mode?: 'append' | 'rescan';
        scope?: 'all' | 'viewport' | 'viewport-buffer';
        viewportBufferScreens?: number;
    };
    execution?: {
        maxItems?: number;
        perItemTimeout?: number;
        scrollIntoView?: boolean;
        includeErrors?: boolean;
        errorPolicy?: 'skip' | 'throw';
        timeout?: number;
    };
}

export interface DataExtractionRequest extends DataExtractorOptions {
    reset?: boolean;
}

export interface BootstrapOptions {
    skipInjection?: boolean;
    bypassOnboarding?: boolean;
}

export type Credentials = {
    type: 'password';
    username: string;
    password: string;
} | {
    type: 'token';
    token: string;
} | {
    type: 'cookie';
    cookies: Array<{
        name: string;
        value: string;
        domain: string;
    }>;
} | {
    type: 'custom';
    [key: string]: unknown;
};

export interface AuthResult {
    success: boolean;
    errorCode?: 'invalid_credentials' | 'account_locked' | 'requires_2fa' | 'captcha' | string;
    message?: string;
}

export interface StorageStateCookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
}

export interface SessionState {
    platform: string;
    cookies: StorageStateCookie[];
    origins: Array<{
        origin: string;
        localStorage: Array<{
            name: string;
            value: string;
        }>;
    }>;
    userAgent?: string;
    capturedAt: number;
}

export interface RestoreSessionResult {
    success: boolean;
    errorCode?: 'session_expired' | 'invalid_state' | 'platform_mismatch' | string;
}

export interface NavTarget {
    type?: string;
    name?: string;
    url?: string;
    params?: Record<string, string>;
}

export interface CurrentLocation {
    pageType: string;
    entityId: string | null;
    scrollAnchor?: string;
    url: string;
}

export type ActionType = 'like' | 'unlike' | 'comment' | 'repost' | 'share' | 'follow' | 'unfollow' | 'bookmark' | 'report' | 'block' | string;

export type ActionPayload = Record<string, unknown>;

export interface ActionResult {
    success: boolean;
    feedback?: string;
    errorCode?: string;
}

export type AnomalyType = 'banned' | 'captcha' | 'rate_limited' | 'session_expired' | 'network_error' | 'content_not_found' | 'ui_changed' | 'unknown';

export interface AnomalyReport {
    anomaly: AnomalyType | null;
    confidence: number;
    description?: string;
}

export interface PlatformCaps {
    supportedActions: ActionType[];
    supportsMediaUpload: boolean;
    supportsInfiniteScroll: boolean;
    supportsMultiAccount: boolean;
    limits?: Record<string, number>;
    [key: string]: unknown;
}

export interface DomainExtensionContext {
    readonly platform: string;
    readonly page: Page;
    readonly playwrightContext: BrowserContext;
    readonly config: Record<string, unknown> | undefined;
}

export interface DomainExtension {
    readonly id: string;
    readonly platform: string | '*';
    bootstrap?(ctx: DomainExtensionContext, options?: BootstrapOptions): Promise<boolean | undefined>;
    authenticate?(ctx: DomainExtensionContext, credentials: Credentials): Promise<AuthResult | undefined>;
    navigate?(ctx: DomainExtensionContext, target: NavTarget): Promise<Page | undefined>;
    action?(ctx: DomainExtensionContext, type: string, payload?: ActionPayload): Promise<ActionResult | undefined>;
    getData?(ctx: DomainExtensionContext, name: string, options?: DataExtractorOptions): ListExtractor | undefined;
}
```

## src/kernel/extraction/FieldSpec.ts

```ts
export interface FieldRegex {
    pattern: string;
    flags?: string;
}

export type FieldSource = 'text' | 'textContent' | 'html' | 'outerHTML' | 'href' | 'src' | 'exists' | 'count' | {
    attr: string;
};

export type FieldParse = 'string' | 'json' | 'number' | 'boolean';

export type FieldTransform = {
    type: 'trim';
} | {
    type: 'normalizeWhitespace';
} | {
    type: 'replace';
    pattern: string | FieldRegex;
    replacement: string;
} | {
    type: 'match';
    pattern: FieldRegex;
    groupIndex?: number;
} | {
    type: 'prefix';
    value: string;
} | {
    type: 'absoluteUrl';
    baseUrl: string;
};

export interface FieldSpec {
    name: string;
    selector?: string;
    nth?: number;
    many?: boolean;
    source?: FieldSource;
    parse?: FieldParse;
    transforms?: FieldTransform[];
    fallback?: JsonValue;
    required?: boolean;
    fields?: FieldSpec[];
}

export type FieldJsonSchema = Record<string, unknown>;
```

## src/kernel/filter/Filter.type.ts

```ts
export interface FilterRegex {
    pattern: string;
    flags?: string;
}

export type FilterLiteral = JsonValue | FilterRegex;

export type FilterMeasure = 'value' | 'length' | 'count';

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'exists' | 'empty' | 'in' | 'some' | 'every' | 'none';

export interface FilterPredicate {
    path: string;
    op: FilterOperator;
    value?: FilterLiteral | FilterLiteral[];
    measure?: FilterMeasure;
    filter?: FilterSpec;
    caseSensitive?: boolean;
}

export type FilterSpec = {
    all: FilterSpec[];
} | {
    any: FilterSpec[];
} | {
    not: FilterSpec;
} | FilterPredicate;

export interface CompiledFilter {
    readonly spec: FilterSpec;
    test(value: unknown): boolean;
}
```

## src/kernel/rule/Rule.type.ts

```ts
export type AtomName = string;

export type SelectorValue = string | string[];

export interface PlatformMeta {
    name: string;
    baseUrl: string;
    capabilities: string[];
    titlePattern?: string;
}

export interface ExtractorRule {
    itemSelector: string;
    idField?: string | null;
    dedupe?: 'field' | 'content' | 'none';
    dedupeFields?: string[];
    maxItems?: number;
    perItemTimeout?: number;
    readiness?: string;
    readinessPolicy?: 'break' | 'skip';
    scan?: ExtractorScanRule;
    scrollIntoView?: boolean;
    includeErrors?: boolean;
    errorPolicy?: 'skip' | 'throw';
    filter?: FilterSpec;
    timeout?: number;
    fields: FieldRule[];
}

export interface ExtractorScanRule {
    mode?: 'append' | 'rescan';
    scope?: 'all' | 'viewport' | 'viewport-buffer';
    viewportBufferScreens?: number;
}

export type FieldRule = FieldSpec;

export interface RouteRule {
    locator?: string | undefined;
    url?: string | undefined;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | undefined;
    check?: {
        selector?: string | undefined;
        text?: string | undefined;
        url?: string | undefined;
        networkIdle?: boolean | undefined;
        delay?: number | undefined;
        timeout?: number | undefined;
    } | undefined;
    entityLocatorTemplate?: string;
    waitForNewPage?: boolean;
    visibilityProbeMs?: number;
}

export interface ActionRule {
    steps: ActionStep[];
}

export type RepeatValue = number | string | {
    min: number | string;
    max: number | string;
};

export type ActionStep = ActionAtomStep | ActionReferenceStep;

export interface ActionStepBase {
    when?: ActionStepCondition;
    probability?: number;
    repeat?: RepeatValue;
    onFailure?: ActionStepFailurePolicy;
}

export interface ActionAtomStep extends ActionStepBase {
    atom: AtomName;
    action?: never;
    options?: Record<string, unknown>;
    timeout?: number;
}

export interface ActionReferenceStep extends ActionStepBase {
    action: string;
    atom?: never;
}

export interface PayloadCondition {
    path: string;
    exists?: boolean;
    equals?: string | number | boolean | null;
    notEquals?: string | number | boolean | null;
}

export interface PageSelectorCondition {
    selector: string;
    state?: 'exists' | 'visible' | 'hidden';
    read?: ElementValueRead;
    compare?: ElementValueCompare;
}

export interface ElementValueRead {
    selector?: string;
    source?: 'text' | 'textContent' | 'attr';
    attr?: string;
    type?: 'string' | 'number' | 'boolean';
}

export type ElementValueCompareOperator = 'equals' | 'notEquals' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

export interface ElementValueCompare {
    operator: ElementValueCompareOperator;
    value: string | number | boolean | null;
}

export interface ElementWhereCondition extends ElementValueRead {
    compare?: ElementValueCompare;
    equals?: string | number | boolean | null;
    notEquals?: string | number | boolean | null;
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
}

export interface PageUrlCondition {
    url: string;
}

export interface AllCondition {
    all: ActionStepCondition[];
}

export interface AnyCondition {
    any: ActionStepCondition[];
}

export interface NotCondition {
    not: ActionStepCondition;
}

export type ActionStepCondition = PayloadCondition | PageSelectorCondition | PageUrlCondition | AllCondition | AnyCondition | NotCondition;

export interface ActionStepFailurePolicy {
    policy: 'throw' | 'continue' | 'retry';
    maxAttempts?: number;
    delay?: number;
    backoff?: 'fixed' | 'linear' | 'exponential';
}

export interface ExistenceCheck {
    selector?: string;
    text?: string;
    mode?: 'exists' | 'visible';
}

export interface AnomalyCheckRule extends ExistenceCheck {
    anomaly: 'banned' | 'captcha' | 'rate_limited' | 'session_expired' | 'network_error' | 'content_not_found' | 'ui_changed' | string;
    description?: string;
}

export interface LocationPatternRule {
    pageType: string;
    urlPattern: string;
    entityIdGroup?: number;
}

export interface DomainRuleSet {
    platform: string;
    version: string;
    schemaVersion?: string;
    hash?: string;
    signature?: string;
    meta: PlatformMeta;
    extractors: Record<string, ExtractorRule>;
    routes: Record<string, RouteRule>;
    actions: Record<string, ActionRule>;
    selectors: Record<string, SelectorValue>;
    loginCheck?: ExistenceCheck;
    anomalyChecks?: AnomalyCheckRule[];
    locationPatterns?: LocationPatternRule[];
}
```

## src/modules/account/Account.type.ts

```ts
export interface AccountRow {
    id: number;
    platform_id: number;
    account_key: string;
    display_name: string | null;
    external_uid: string | null;
    extra: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface AccountPageRow extends AccountRow {
    platform_name: string;
}

export interface CreateAccountInput {
    platformId: number;
    accountKey: string;
    displayName?: string;
    externalUid?: string;
    extra?: Record<string, unknown>;
}

export interface PatchAccountInput {
    displayName?: string | null;
    externalUid?: string | null;
    extra?: Record<string, unknown>;
    isActive?: boolean;
}
```

## src/modules/action/Action.type.ts

```ts
export interface ActionTypeRow {
    id: number;
    code: string;
    name: string;
    category: 'browse' | 'interaction' | 'content' | string;
    is_reversible: number;
    schema_hint: string;
    created_at: string;
}

export interface CreateActionTypeInput {
    code: string;
    name: string;
    category?: 'browse' | 'interaction' | 'content';
    isReversible?: boolean;
    schemaHint?: Record<string, unknown>;
}

export interface ActionRow {
    id: number;
    session_id: number | null;
    observation_id: number | null;
    content_item_id: number | null;
    agent_id: string | null;
    skill_id: string | null;
    skill_name: string | null;
    platform: string;
    account_id: number | null;
    action_type_id: number;
    status: 'success' | 'failed' | 'skipped';
    payload: string;
    error_message: string | null;
    occurred_at: string;
    agent_name?: string | null;
    account_name?: string | null;
    account_key?: string | null;
    platform_name?: string | null;
}

export interface RecordActionInput {
    sessionId?: number | null;
    observationId?: number | null;
    contentItemId?: number | null;
    actionTypeCode: string;
    platform?: string;
    platformId?: number;
    accountId?: number | null;
    agentId?: string | null;
    skillId?: string | null;
    skillName?: string | null;
    status?: 'success' | 'failed' | 'skipped';
    payload?: Record<string, unknown>;
    errorMessage?: string;
}
```

## src/modules/content/Content.type.ts

```ts
export interface ContentItemRow {
    id: number;
    platform: string;
    content_type: string;
    external_id: string;
    parent_id: number | null;
    title: string | null;
    summary: string | null;
    url: string | null;
    raw_data: string;
    metadata: string;
    tags: string;
    first_seen_at: string;
    last_seen_at: string;
    seen_count: number;
}

export interface UpsertContentInput {
    platform?: string;
    platformId?: number;
    contentType: string;
    externalId: string;
    parentId?: number | null;
    title?: string;
    summary?: string;
    url?: string;
    rawData?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    tags?: string[];
    sessionId?: number | null;
    agentId?: string | null;
    skillId?: string | null;
    skillName?: string | null;
    accountId?: number | null;
    observationSource?: string;
    observationMeta?: Record<string, unknown>;
    displayPath?: string | null;
    sortOrder?: number;
}

export interface UpsertContentResult {
    id: number;
    observationId: number;
    contentItemId: number;
    seenCount: number;
    isNew: boolean;
}

export interface ContentObservationRow {
    id: number;
    content_item_id: number;
    is_new: number;
    session_id: number | null;
    agent_id: string | null;
    skill_id: string | null;
    skill_name: string | null;
    platform: string;
    account_id: number | null;
    source: string;
    display_path: string | null;
    sort_order: number;
    metadata: string;
    created_at: string;
    agent_name?: string | null;
    account_name?: string | null;
    account_key?: string | null;
    platform_name?: string | null;
    session_started_at?: string | null;
}

export interface ContentObservationWithItemRow extends ContentObservationRow {
    item_id: number;
    content_type: string;
    external_id: string;
    parent_id: number | null;
    title: string | null;
    summary: string | null;
    url: string | null;
    raw_data: string;
    item_metadata: string;
    tags: string;
    first_seen_at: string;
    last_seen_at: string;
    seen_count: number;
}

export interface ListContentsParams {
    observationIds?: number[];
    platform?: string | undefined;
    platformId?: number | undefined;
    contentType?: string | undefined;
    externalId?: string | undefined;
    parentId?: number | undefined;
    keyword?: string | undefined;
    sessionId?: number | null | undefined;
    accountId?: number | undefined;
    agentId?: string | null | undefined;
    skillId?: string | undefined;
    source?: string | undefined;
    observationSource?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}

export type ContentOptionKind = 'platform' | 'content_type' | 'agent' | 'session';

export interface CreateContentObservationInput {
    contentItemId: number;
    platform?: string | undefined;
    platformId?: number | undefined;
    sessionId?: number | null | undefined;
    accountId?: number | null | undefined;
    agentId?: string | null | undefined;
    skillId?: string | null | undefined;
    skillName?: string | null | undefined;
    source?: string | undefined;
    actionTypeCode?: string | null | undefined;
    metadata?: Record<string, unknown> | undefined;
    displayPath?: string | null | undefined;
    sortOrder?: number | undefined;
}
```

## src/modules/platform/Platform.type.ts

```ts
export interface PlatformRow {
    id: number;
    code: string;
    name: string;
    base_url: string | null;
    capabilities: string;
    config: string;
    current_rule_uuid: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreatePlatformInput {
    code: string;
    name: string;
    baseUrl?: string | null;
    capabilities?: string[];
    config?: Record<string, unknown>;
}

export type UpsertPlatformInput = CreatePlatformInput;

export interface PlatformDomainRow {
    id: number;
    platform_id: number;
    domain: string;
    domain_type: string;
}
```

## src/modules/report/Report.type.ts

```ts
export interface ReportLogRow {
    id: number;
    report_date: string;
    scope: string;
    payload: string;
    status: 'pending' | 'success' | 'failed';
    attempt_count: number;
    last_error: string | null;
    agent_id: string | null;
    created_at: string;
    reported_at: string | null;
}

export interface ListReportsParams {
    agentId?: string | null | undefined;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}
```

## src/modules/rule/Rule.type.ts

```ts
export type PlatformRuleStatus = 'draft' | 'current' | 'archived';

export type PlatformRuleSource = 'source' | 'user' | 'market';

export type PlatformRuleValidationStatus = 'unknown' | 'valid' | 'invalid';

export interface PlatformRuleRow {
    id: number;
    uuid: string;
    platform: string;
    version: string;
    source: PlatformRuleSource;
    status: PlatformRuleStatus;
    schema_version: string;
    rule_json: string;
    hash: string | null;
    validation_status: PlatformRuleValidationStatus;
    validation_errors: string;
    note: string | null;
    created_at: string;
    updated_at: string;
}

export interface SavePlatformRuleInput {
    uuid?: string;
    platform: string;
    version?: string;
    schemaVersion?: string;
    source?: PlatformRuleSource;
    ruleJson: string;
    hash?: string;
    validationStatus?: PlatformRuleValidationStatus;
    validationErrors?: string[];
    note?: string;
}
```

## src/modules/session/Session.type.ts

```ts
export type SessionStatus = 'running' | 'completed' | 'aborted' | 'error';

export interface SessionRow {
    id: number;
    session_key: string | null;
    agent_id: string | null;
    skill_id: string | null;
    skill_name: string | null;
    platform: string | null;
    rule_uuid: string | null;
    rule_version: string | null;
    account_id: number | null;
    status: SessionStatus;
    started_at: string;
    ended_at: string | null;
    duration_ms: number | null;
    content_count: number;
    new_content_count: number;
    action_count: number;
    params: string;
    result: string;
    error: string | null;
    agent_name?: string | null;
    account_name?: string | null;
    account_key?: string | null;
    platform_name?: string | null;
}

export interface EndSessionInput {
    status: 'completed' | 'aborted' | 'error';
    endReason?: string;
    durationMs?: number;
    contentCount?: number;
    newContentCount?: number;
    actionCount?: number;
    result?: Record<string, unknown>;
    error?: string;
}

export interface SessionProgressDelta {
    contentCount?: number;
    newContentCount?: number;
    actionCount?: number;
}
```

## src/modules/statistics/Statistics.type.ts

```ts
export interface DailyStatsRow {
    id: number;
    stat_date: string;
    agent_id: string | null;
    skill_id: string | null;
    platform: string | null;
    account_id: number | null;
    session_count: number;
    content_count: number;
    new_content_count: number;
    action_count: number;
    action_counts: string;
    extra: string;
    updated_at: string;
}

export interface ListStatsParams {
    agentId?: string | null | undefined;
    skillId?: string | undefined;
    platform?: string | undefined;
    platformId?: number | undefined;
    accountId?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}

export interface StatsScope {
    agentId?: string | null;
    skillId?: string | null;
    platform?: string | null;
    platformId?: number | null;
    accountId?: number | null;
}
```

## src/shared/types/Common.type.ts

```ts
export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | {
    [key: string]: JsonValue;
};

export interface PageRequest {
    limit?: number;
    offset?: number;
}

export interface PageResult<T> {
    rows: T[];
    total: number;
    limit: number;
    offset: number;
}
```
