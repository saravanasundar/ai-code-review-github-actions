const core = require('@actions/core');
const github = require('@actions/github');
const { Configuration, OpenAIApi } = require('openai');
const { execSync } = require('child_process');
const fs = require('fs');

const confirugartion = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(confirugartion);

async function run() {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);
    const context = github.context;
    const prNumber = context.payload.pull_request.number;
    const repo = context.repo;
    const commitId = context.payload.pull_request.head.sha;

    const eslintOutput = execSync('npx eslint . --format json').toString();
    const lintResults = JSON.parse(eslintOutput);

    for (const file of lintResults) {
        const filePath = file.filePath.replace(`${process.cwd()}/`, '');
        for (const message of file.messages) {
            const line = message.line;
            const codeLine = fs.readFileSync(file.filePath, 'utf-8').split('\n')[line - 1];

            const prompt = `This line has a lint issue: "${message.message}". Suggest a better version of this line:\n${codeLine}`;
            const response = await openai.createChatCompletion({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a code reviewer.' },
                    { role: 'user', content: `Review this code and suggest improvements:\n\n${code}` },
                ]
            });

            const suggestion = response.data.choices[0].message.content;
            if (!suggestion.includes('No suggestion')) {
                try {
                    await octokit.rest.pulls.createReviewComment({
                        owner: repo.owner,
                        repo: repo.repo,
                        pull_number: prNumber,
                        commit_id: commitId,
                        path: filePath,
                        line,
                        side: 'RIGHT',
                        body: `Line Issue: ${message.message}\n AI Suggestion:\n${suggestion}`
                    });
                } catch (err) {
                    console.error(`Failed to comment on ${filePath} at line ${line}`, err.message);
                }
            }
        }
    }
}

run();