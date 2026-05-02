Deploy this project to GitHub Pages and return the live URL.

Follow these steps exactly, in order. Stop and inform the user if any step fails before continuing.

---

## Step 1 — Check GitHub CLI

Run `gh --version`. If the command is not found, tell the user to install it:
- macOS: `brew install gh`
- Other: https://cli.github.com/

Do not continue until `gh` is available.

## Step 2 — Check GitHub authentication

Run `gh auth status`.

If the user is not logged in, tell them to run the following in the prompt so the login flow runs in this session:
```
! gh auth login
```

The command runs in the background. After it starts, read the output file to retrieve the one-time code and display it to the user:
1. The background task will print its output file path — read that file.
2. Extract the one-time code (format: `XXXX-XXXX`) from the line `! First copy your one-time code: XXXX-XXXX`.
3. Tell the user their one-time code and direct them to https://github.com/login/device to complete login.
4. Wait for the task to complete (the output will show `✓ Authentication complete.`), then re-run `gh auth status` to confirm login succeeded before continuing.

## Step 3 — Check git repository

Run `git status` in the project root.

If the directory is not a git repository, initialize one:
```
git init
git add .
git commit -m "initial commit"
```

## Step 4 — Determine the GitHub remote

Run `git remote get-url origin`.

**If a remote already exists**, extract the repo name and owner from the URL and skip to Step 5.

**If no remote exists**, create a new GitHub repository:
1. Ask the user what they want to name the repository (suggest the current directory name as default).
2. Ask whether the repo should be public or private (default: public).
3. Create the repo and add it as the remote:
   ```
   gh repo create <repo-name> --public --source=. --remote=origin --push
   ```
   Replace `--public` with `--private` if the user chose private.

After this step you must know:
- `REPO_NAME` — the repository name (e.g. `my-game`)
- `GITHUB_USER` — the owner's GitHub username (get it from `gh api user --jq .login`)

## Step 5 — Configure Vite base URL

GitHub Pages serves the site at `https://<GITHUB_USER>.github.io/<REPO_NAME>/`, so Vite must know the base path.

Read `vite.config.ts`. Look for an existing `base` field inside `defineConfig({...})`.

- If `base` is already set to `/<REPO_NAME>/`, skip this step.
- Otherwise, add or update the `base` field:
  ```ts
  base: '/<REPO_NAME>/',
  ```
  Insert it as the first key inside `defineConfig({ ... })`.

After editing, commit the change:
```
git add vite.config.ts
git commit -m "set vite base for GitHub Pages deployment"
```

## Step 6 — Install the gh-pages package

Run `npm list gh-pages --depth=0`. If it is not installed, run:
```
npm install --save-dev gh-pages
```

## Step 7 — Add deploy script to package.json

Read `package.json`. Check if a `"deploy"` script already exists under `"scripts"`.

If it does not exist, add it. The deploy script must publish the `build/` directory (not `dist/`) to the `gh-pages` branch:
```json
"deploy": "gh-pages -d build"
```

After editing, commit:
```
git add package.json
git commit -m "add GitHub Pages deploy script"
```

## Step 8 — Push all commits to GitHub

Run:
```
git push -u origin main
```

If the push is rejected because the remote has diverged, tell the user and ask how to proceed — do NOT force-push without explicit permission.

## Step 9 — Build the project

Run:
```
npm run build
```

The output goes to `build/`. If the build fails, show the error and stop.

## Step 10 — Deploy to GitHub Pages

Run:
```
npm run deploy
```

This publishes the `build/` directory to the `gh-pages` branch on GitHub.

## Step 11 — Enable GitHub Pages in repo settings (if needed)

Run:
```
gh api repos/{owner}/{repo}/pages --method POST --field source[branch]=gh-pages --field source[path]=/ 2>&1
```

Replace `{owner}` and `{repo}` with the actual values. If the response says Pages is already enabled, ignore the error.

## Step 12 — Return the live URL

Tell the user:
- The site will be live at: `https://<GITHUB_USER>.github.io/<REPO_NAME>/`
- GitHub Pages can take **1–3 minutes** to go live after the first deployment.
- They can check deployment status at: `https://github.com/<GITHUB_USER>/<REPO_NAME>/actions`

---

## Important notes

- **WASM file**: This project uses `sql.js`. The `sql-wasm.wasm` file is in `public/` and Vite copies it to `build/` automatically — no extra config is needed.
- **Base path in code**: The `locateFile` callback in `src/db/database.ts` prepends `/` to locate the WASM file. After setting the Vite `base`, this becomes relative to the sub-path automatically because Vite rewrites asset URLs. If the game fails to load the WASM on GitHub Pages, check the `locateFile` callback and update it to use `import.meta.env.BASE_URL` instead of `/`.
- **Private repos**: GitHub Pages is available on private repos only with GitHub Pro or higher. Warn the user if they chose private.
