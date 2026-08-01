#!/usr/bin/env node
/**
 * Publish the local build to the `deploy` branch, which is what
 * Hostinger pulls.
 *
 * Why a separate branch: Hostinger's Git integration clones a branch
 * straight into the web root. Pointing it at `main` would put src/,
 * package.json and the whole toolchain under the document root. The
 * `deploy` branch contains the built site and nothing else, so the web
 * root holds exactly what should be public.
 *
 * The branch is built fresh each time from dist/ via a temporary git
 * worktree, so it never accumulates files deleted from the build.
 *
 * Usage: npm run deploy
 */
import { execFileSync } from "node:child_process";
import { existsSync, rmSync, readdirSync, cpSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const WORKTREE = join(ROOT, ".deploy-worktree");
const BRANCH = "deploy";

function git(args, opts = {}) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}

if (!existsSync(DIST) || readdirSync(DIST).length === 0) {
  console.error("✖ dist/ is empty or missing. Run `npm run build` first.");
  process.exit(1);
}

// Refuse to publish a build made from uncommitted work: the deployed
// site should always be traceable to a commit on main.
const dirty = git(["status", "--porcelain"]);
if (dirty) {
  console.error("✖ Working tree is dirty. Commit your changes before deploying.\n");
  console.error(dirty);
  process.exit(1);
}

const sha = git(["rev-parse", "--short", "HEAD"]);
const sourceBranch = git(["rev-parse", "--abbrev-ref", "HEAD"]);

// Start clean in case a previous run was interrupted.
if (existsSync(WORKTREE)) {
  try {
    git(["worktree", "remove", "--force", WORKTREE]);
  } catch {
    rmSync(WORKTREE, { recursive: true, force: true });
  }
}

const branchExists = (() => {
  try {
    git(["show-ref", "--verify", "--quiet", `refs/heads/${BRANCH}`]);
    return true;
  } catch {
    return false;
  }
})();

if (branchExists) {
  git(["worktree", "add", WORKTREE, BRANCH]);
} else {
  git(["worktree", "add", "--detach", WORKTREE]);
  execFileSync("git", ["checkout", "--orphan", BRANCH], { cwd: WORKTREE, stdio: "inherit" });
}

try {
  /*
   * Clear the index before touching the disk. A fresh orphan branch
   * inherits the parent's staged index, so `git rm` would refuse with
   * "changes staged in the index"; an unstage first makes the orphan
   * and existing-branch cases behave identically.
   */
  execFileSync("git", ["reset", "-q"], { cwd: WORKTREE });
  for (const entry of readdirSync(WORKTREE)) {
    if (entry === ".git") continue;
    rmSync(join(WORKTREE, entry), { recursive: true, force: true });
  }

  cpSync(DIST, WORKTREE, { recursive: true });

  execFileSync("git", ["add", "-A"], { cwd: WORKTREE });

  const staged = execFileSync("git", ["status", "--porcelain"], {
    cwd: WORKTREE,
    encoding: "utf8",
  }).trim();

  if (!staged) {
    console.log("✓ Build is identical to the deployed version. Nothing to publish.");
  } else {
    execFileSync("git", ["commit", "-m", `Deploy ${sha} from ${sourceBranch}`], {
      cwd: WORKTREE,
      stdio: "inherit",
    });
    execFileSync("git", ["push", "origin", BRANCH], { cwd: WORKTREE, stdio: "inherit" });
    console.log(`\n✓ Published build of ${sha} to the '${BRANCH}' branch.`);
    console.log("  Hostinger will serve it on its next pull.");
  }
} finally {
  git(["worktree", "remove", "--force", WORKTREE]);
}
