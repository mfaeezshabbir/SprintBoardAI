// Appwrite Function: generate-ai-summary
// Local-testable Node script that reads commits.json produced by fetch-github-data and produces a simple text summary.

const fs = require('fs');

function sentimentScore(msg) {
  if (!msg) return 0;
  const positive = ['fix', 'add', 'improve', 'refactor', 'update', 'feat'];
  const negative = ['bug', 'fail', 'broken', 'revert', 'wip', 'fixme', 'hotfix'];
  const m = msg.toLowerCase();
  let score = 0;
  for (const p of positive) if (m.includes(p)) score += 1;
  for (const n of negative) if (m.includes(n)) score -= 1;
  return score;
}

function summarizeCommits(commits) {
  const byAuthor = {};
  let totalScore = 0;
  for (const c of commits) {
    const a = c.author || 'unknown';
    byAuthor[a] = (byAuthor[a] || 0) + 1;
    totalScore += sentimentScore(c.message || '');
  }
  const authors = Object.entries(byAuthor).sort((a, b) => b[1] - a[1]);
  const topAuthors = authors.slice(0, 5).map(([name, count]) => `${name} (${count})`).join(', ');
  const avgSentiment = commits.length ? (totalScore / commits.length).toFixed(2) : '0';
  return `Commit summary: ${commits.length} commits. Top contributors: ${topAuthors}. Average commit sentiment score: ${avgSentiment}`;
}

async function main(opts = {}) {
  let inDir = opts.inDir || process.env.IN_DIR || __dirname;
  let inPath = `${inDir}/commits.json`;
  if (!fs.existsSync(inPath)) {
    // try sibling fetch-github-data folder
    const sibling = `${__dirname}/../fetch-github-data/commits.json`;
    if (fs.existsSync(sibling)) inPath = sibling;
  }
  if (!fs.existsSync(inPath)) throw new Error(`Input commits file not found: ${inPath}`);
  const raw = JSON.parse(fs.readFileSync(inPath, 'utf8'));
  const commits = raw.commits || [];
  const summary = summarizeCommits(commits);
  const outPath = `${inDir}/summary.txt`;
  fs.writeFileSync(outPath, summary);
  console.log('Wrote summary to', outPath);
  return { path: outPath, summary };
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
