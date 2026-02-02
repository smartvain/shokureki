import { Octokit } from "@octokit/rest";

export interface RawActivity {
  source: "github";
  activityType: "pr_merged" | "pr_reviewed" | "commit" | "issue_closed";
  title: string;
  body: string;
  externalUrl: string;
  metadata: Record<string, unknown>;
}

interface CollectOptions {
  token: string;
  repos: string[]; // ["owner/repo", ...]
  date: string; // YYYY-MM-DD
}

export async function collectGitHubActivities(options: CollectOptions): Promise<RawActivity[]> {
  const octokit = new Octokit({ auth: options.token });
  const since = `${options.date}T00:00:00Z`;
  const until = `${options.date}T23:59:59Z`;
  const activities: RawActivity[] = [];

  const { data: user } = await octokit.users.getAuthenticated();
  const username = user.login;

  for (const repoFullName of options.repos) {
    const [owner, repo] = repoFullName.split("/");

    // Collect merged PRs authored by user
    const prs = await collectMergedPRs(octokit, owner, repo, username, since, until);
    activities.push(...prs);

    // Collect PRs reviewed by user
    const reviews = await collectReviewedPRs(octokit, owner, repo, username, since, until);
    activities.push(...reviews);

    // Collect closed issues
    const issues = await collectClosedIssues(octokit, owner, repo, username, since, until);
    activities.push(...issues);
  }

  return activities;
}

async function collectMergedPRs(
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string,
  since: string,
  until: string
): Promise<RawActivity[]> {
  try {
    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
      per_page: 50,
    });

    return prs
      .filter(
        (pr) =>
          pr.merged_at &&
          pr.merged_at >= since &&
          pr.merged_at <= until &&
          pr.user?.login === username
      )
      .map((pr) => ({
        source: "github" as const,
        activityType: "pr_merged" as const,
        title: pr.title,
        body: pr.body || "",
        externalUrl: pr.html_url,
        metadata: {
          number: pr.number,
          repo: `${owner}/${repo}`,
          labels: pr.labels.map((l) => l.name),
        },
      }));
  } catch {
    return [];
  }
}

async function collectReviewedPRs(
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string,
  since: string,
  until: string
): Promise<RawActivity[]> {
  try {
    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: 50,
    });

    const reviewed: RawActivity[] = [];

    for (const pr of prs) {
      if (pr.user?.login === username) continue; // Skip own PRs
      if (pr.updated_at < since || pr.updated_at > until) continue;

      try {
        const { data: reviews } = await octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: pr.number,
        });

        const userReviews = reviews.filter(
          (r) =>
            r.user?.login === username &&
            r.submitted_at &&
            r.submitted_at >= since &&
            r.submitted_at <= until
        );

        if (userReviews.length > 0) {
          reviewed.push({
            source: "github",
            activityType: "pr_reviewed",
            title: `Review: ${pr.title}`,
            body: userReviews.map((r) => r.body || "").join("\n"),
            externalUrl: pr.html_url,
            metadata: {
              number: pr.number,
              repo: `${owner}/${repo}`,
              reviewCount: userReviews.length,
              states: userReviews.map((r) => r.state),
            },
          });
        }
      } catch {
        // Skip if review fetch fails
      }
    }

    return reviewed;
  } catch {
    return [];
  }
}

async function collectClosedIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string,
  since: string,
  until: string
): Promise<RawActivity[]> {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "closed",
      assignee: username,
      since,
      sort: "updated",
      direction: "desc",
      per_page: 50,
    });

    return issues
      .filter(
        (issue) =>
          !issue.pull_request && // Exclude PRs
          issue.closed_at &&
          issue.closed_at >= since &&
          issue.closed_at <= until
      )
      .map((issue) => ({
        source: "github" as const,
        activityType: "issue_closed" as const,
        title: issue.title,
        body: issue.body || "",
        externalUrl: issue.html_url,
        metadata: {
          number: issue.number,
          repo: `${owner}/${repo}`,
          labels: issue.labels.map((l) => (typeof l === "string" ? l : l.name || "")),
        },
      }));
  } catch {
    return [];
  }
}
