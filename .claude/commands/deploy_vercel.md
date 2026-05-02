Deploy this project to Vercel and return the live URL.

Follow these steps exactly:

1. Check if the Vercel CLI is installed by running `vercel --version`. If not found, install it globally with `npm install -g vercel`.

2. Build the project with `npm run build`. The output goes to the `build/` directory (not `dist/`).

3. Deploy to Vercel by running:
   ```
   vercel build/ --yes --public
   ```
   - `--yes` accepts all defaults so no interactive prompts appear
   - `--public` makes the deployment publicly accessible
   - Pass `build/` as the deployment path since that is where the compiled output lives

4. Capture the deployment URL from the command output (it looks like `https://....vercel.app`) and show it to the user so they can open it in the browser.

5. If the deployment requires authentication (`vercel login`), tell the user to run `! vercel login` in the prompt so the login flow runs in this session, then retry the deploy.

Note: This project uses sql.js WASM. The `sql-wasm.wasm` file is in `public/` and Vite copies it to `build/` automatically — no extra configuration needed.
