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
  const activities: RawActivity[] = [];

  const { data: user } = await octokit.users.getAuthenticated();
  const username = user.login;

  for (const repoFullName of options.repos) {
    const [owner, repo] = repoFullName.split("/");

    // Collect merged PRs authored by user
    const prs = await collectMergedPRs(octokit, owner, repo, username, options.date);
    activities.push(...prs);

    // Collect PRs reviewed by user
    const reviews = await collectReviewedPRs(octokit, owner, repo, username, options.date);
    activities.push(...reviews);

    // Collect closed issues
    const issues = await collectClosedIssues(octokit, owner, repo, username, options.date);
    activities.push(...issues);
  }

  return activities;
}

async function collectMergedPRs(
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string,
  date: string
): Promise<RawActivity[]> {
  try {
    const q = `repo:${owner}/${repo} type:pr author:${username} is:merged merged:${date}`;
    const { data } = await octokit.search.issuesAndPullRequests({
      q,
      per_page: 100,
      sort: "updated",
      order: "desc",
    });

    return data.items.map((item) => ({
      source: "github" as const,
      activityType: "pr_merged" as const,
      title: item.title,
      body: item.body || "",
      externalUrl: item.html_url,
      metadata: {
        number: item.number,
        repo: `${owner}/${repo}`,
        labels: item.labels.map((l) => l.name),
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
  date: string
): Promise<RawActivity[]> {
  try {
    const q = `repo:${owner}/${repo} type:pr reviewed-by:${username} -author:${username} updated:${date}`;
    const { data } = await octokit.search.issuesAndPullRequests({
      q,
      per_page: 100,
      sort: "updated",
      order: "desc",
    });

    const reviewed: RawActivity[] = [];
    const since = `${date}T00:00:00Z`;
    const until = `${date}T23:59:59Z`;

    for (const item of data.items) {
      try {
        const { data: reviews } = await octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: item.number,
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
            title: `Review: ${item.title}`,
            body: userReviews.map((r) => r.body || "").join("\n"),
            externalUrl: item.html_url,
            metadata: {
              number: item.number,
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
  date: string
): Promise<RawActivity[]> {
  try {
    const q = `repo:${owner}/${repo} type:issue assignee:${username} is:closed closed:${date}`;
    const { data } = await octokit.search.issuesAndPullRequests({
      q,
      per_page: 100,
      sort: "updated",
      order: "desc",
    });

    return data.items
      .filter((item) => !item.pull_request)
      .map((item) => ({
        source: "github" as const,
        activityType: "issue_closed" as const,
        title: item.title,
        body: item.body || "",
        externalUrl: item.html_url,
        metadata: {
          number: item.number,
          repo: `${owner}/${repo}`,
          labels: item.labels.map((l) => (typeof l === "string" ? l : l.name || "")),
        },
      }));
  } catch {
    return [];
  }
}
