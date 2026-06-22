# Manus publication instruction

You are responsible for auditing and publishing the uploaded archive `sz-dispatch-artifact-validator-v0.3-public.zip` as an independent public GitHub repository.

## Target

- Owner: `sangziwang91-design`
- Repository: `sz-dispatch-artifact-validator`
- Visibility: Public
- Default branch: `main`
- Release: `v0.3.0-experimental`
- Description: `Evidence-first capability probe for browser and Claude Artifact runtimes. Direct browser API calls removed; host-native integration remains runtime-dependent.`

## Non-negotiable claim boundary

This project is an experimental runtime capability probe. It is not:

- a working multi-model dispatcher;
- a provider quota bypass;
- proof of free or separate compute;
- proof of token, cost, latency, or quality improvement;
- production-ready software.

## Execute without stopping at a plan

`READ → BASELINE → SECURITY AUDIT → TEST → MINIMAL FIX → PACKAGE AUDIT → PUBLISH → REMOTE VERIFY → DELIVER`

### 1. READ

1. Extract the ZIP into a fresh temporary directory.
2. Print the complete file tree.
3. Read:
   - `README.md`
   - `INSTALL.md`
   - `KNOWN_LIMITATIONS.md`
   - `SECURITY.md`
   - `docs/SOURCE_AND_CHANGES.md`
   - `prompts/CLAUDE_ARTIFACT_INSTALL_PROMPT.md`
   - all files under `src/`, `tests/`, and `evidence/`.
4. Confirm that the original private `sz-dispatch-validator-v0.2.tsx` is not included.

### 2. SECURITY AUDIT

Search all files, including source maps and package lock, for:

- `api.anthropic.com` in executable browser code;
- API keys, bearer tokens, cookies, OAuth data, emails, user IDs, account names, local absolute paths, private Notion data, and private MCP endpoints;
- `.env`, build output, logs, caches, ZIPs, screenshots, or personal files;
- hard-coded provider model IDs;
- accidental copies of the private source.

Allowed occurrences:

- documentation explaining that direct browser API calls were removed;
- the sanitized failure evidence text `FETCH: Invalid response format`;
- the public GitHub owner and intended repository name.

If a real credential or private datum is found, stop publication and report the exact file and line. Do not echo the credential.

### 3. TEST

Use Node.js 20+ and npm 10+.

```bash
npm install
npm test
npm run build
```

Then start the app:

```bash
npm run dev -- --host 127.0.0.1
```

Verify in the browser:

1. The app renders without console errors.
2. With no injected bridge, Model bridge displays `Unavailable`.
3. The PONG probe does not simulate success.
4. Running the full validator produces UNKNOWN/SKIP for unavailable capabilities, not a false BLOCKED verdict.
5. JSON export contains a claim ceiling and redacts synthetic secrets used in testing.
6. The built bundle contains no provider credential and no direct Anthropic Messages API call.

Record exact commands, versions, test counts, build result, and browser observations.

### 4. MINIMAL FIX RULE

You may fix only:

- build/test failures;
- credential or privacy leakage;
- broken installation instructions;
- inaccurate public claims;
- obvious runtime crashes;
- repository packaging defects.

Do not add new frameworks, backends, databases, MCP integrations, model providers, analytics, websites, or product features. Do not reintroduce direct browser API calls.

After every change, rerun `npm test` and `npm run build`.

### 5. PACKAGE AUDIT

Before publishing, confirm the repository contains only source and public documentation. Exclude:

- `node_modules/`
- `dist/`
- coverage output
- `.env*`
- logs
- uploaded ZIP files
- caches
- local screenshots
- private source files.

Ensure `LICENSE` is MIT and `package.json` version is `0.3.0-experimental`.

### 6. PUBLISH

If the repository does not exist, create it without auto-generating README, License, or `.gitignore`.

Initialize and push:

```bash
git init
git branch -M main
git add README.md INSTALL.md KNOWN_LIMITATIONS.md SECURITY.md LICENSE package.json package-lock.json vite.config.js index.html .gitignore src tests evidence docs prompts MANUS_PUBLISH_INSTRUCTION.md
git commit -m "Initial experimental capability probe release"
git remote add origin https://github.com/sangziwang91-design/sz-dispatch-artifact-validator.git
git push -u origin main
```

Create tag and release:

```bash
git tag -a v0.3.0-experimental -m "SZ Dispatch Artifact Validator v0.3.0-experimental"
git push origin v0.3.0-experimental
```

Release title:

`SZ Dispatch Artifact Validator v0.3.0-experimental`

Release notes must state:

- derived from a private v0.2 validator;
- direct browser Anthropic API calls were removed;
- provider-neutral injected adapter added;
- host-native PONG probe added;
- UNKNOWN is separate from FAIL;
- the included run evidence blocks only the tested direct browser path;
- host-native Claude integration, storage, cost savings, and production reliability remain unverified.

Do not upload the original private source. You may attach the clean public source ZIP as a Release asset, but do not commit it to the repository.

### 7. REMOTE VERIFY

After pushing, verify from GitHub:

1. Repository is Public.
2. Default branch is `main`.
3. README renders correctly.
4. MIT License is recognized.
5. Tag and Release exist.
6. Source files, tests, evidence, installation prompt, and limitations are present.
7. No ZIP, cache, build output, private source, or secret exists in the repository.
8. Clone the remote repository into a new temporary directory and rerun:

```bash
npm install
npm test
npm run build
```

If GitHub workflow permissions are unavailable, do not claim CI. State `CI: NOT INSTALLED` and preserve the local and fresh-clone test evidence.

### 8. DELIVER

Return one final report with:

- repository URL;
- release URL;
- visibility;
- default branch;
- commit SHA;
- tag;
- local test result;
- fresh-clone test result;
- exact files changed before publication;
- GitHub evidence;
- CI status;
- remaining UNKNOWN items;
- confirmation that no credential, private source, or direct browser Anthropic API call was published.

Stop after delivery. Do not create a website, roadmap, v0.4, analytics, badges for absent CI, or a new system.
