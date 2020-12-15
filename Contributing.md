Contributing to <<PROJECT NAME>>
✨ Thank you for taking the time to contribute to this project ✨

📖 Table of Contents
Code of Conduct
Developing
Submitting a new feature
Reporting bugs
Contributing
Coding conventions
Code of Conduct
This project adheres to the Ally Code of Conduct. By contributing, you are expected to honor these guidelines.

Developing
Installation
Fork the repository <<PROJECT NAME>> to your GitHub account.

Afterwards run the following commands in your terminal

$ git clone https://github.com/<your-github-username>/<<PROJECT NAME>>
$ cd <<PROJECT NAME>>
replace your-github-username with your github username

Install the dependencies by running

$ cd npm install
You can now run any of these scripts from the root folder.

Running tests
npm run test:lint
Verifies that your code matches the Ally code style defined in this config.

npm test
Runs unit tests.

npm run test:git-history
Verifies the format of all commit messages on the current branch.

npm posttest
Runs linting on the current branch and checks that the commits follow conventional commits

Submitting a new feature
When submitting a new feature request or enhancement of an existing features please review the following:

Is your feature request related to a problem
Please provide a clear and concise description of what you want and what your use case is.

Provide an example
Please include a snippets of the code of the new feature.

Describe the suggested enhancement
A clear and concise description of the enhancement to be added include a step-by-step guide if applicable. Add any other context or screenshots or animated GIFs about the feature request

Describe alternatives you've considered
A clear and concise description of any alternative solutions or features you've considered.

Reporting bugs
All issues are submitted within GitHub issues. Please check this before submitting a new issue.

Describe the bug
A clear and concise description of what the bug is.

Provide step-by-step guide on how to reproduce the bug
Steps to reproduce the behavior, please provide code snippets or a link to repository

Expected behavior
Please provide a description of the expected behavior

Screenshots
If applicable, add screenshots or animated GIFs to help explain your problem.

System information
Provide the system information which is not limited to the below:

OS: [e.g. macOS, Windows]
Version of <<PROJECT NAME>>: [e.g. 5.0.0]
Node version:[e.g 10.15.1]
Security Bugs
Please review our Security Policy. Please follow the instructions outlined in the policy.

Getting in contact
Join our Slack channel request an invite here
Coding conventions
Git Commit Guidelines
We follow conventional commits for git commit message formatting. These rules make it easier to review commit logs and improve contextual understanding of code changes. This also allows us to auto-generate the CHANGELOG from commit messages.
