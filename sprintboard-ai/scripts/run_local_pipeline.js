// Simple runner to test fetch-github-data and generate-ai-summary locally
// Usage: node run_local_pipeline.js owner/repo

const path = require('path');
const { spawnSync } = require('child_process');

const repo = process.argv[2] || 'octocat/Hello-World';
const functionsDir = path.join(__dirname, '..', 'appwrite', 'functions');

console.log('Running pipeline for', repo);

const fetch = spawnSync('node', [path.join(functionsDir, 'fetch-github-data', 'index.js'), repo], { stdio: 'inherit' });
if (fetch.status !== 0) process.exit(fetch.status);

const summarize = spawnSync('node', [path.join(functionsDir, 'generate-ai-summary', 'index.js')], { cwd: path.join(functionsDir, 'fetch-github-data'), stdio: 'inherit' });
if (summarize.status !== 0) process.exit(summarize.status);

console.log('Pipeline finished. Outputs:');
console.log('- commits:', path.join(functionsDir, 'fetch-github-data', 'commits.json'));
console.log('- summary:', path.join(functionsDir, 'fetch-github-data', 'summary.txt'));
