# Contributing to Soda

Thank you for taking the time to contribute to this project.

We are open to, and grateful for, any contributions made by the community. By
contributing to **Soda**, you agree to abide by the
[code of conduct](https://github.com/Ally-Financial/soda/blob/main/CODE_OF_CONDUCT.md).

## Reporting Issues and Asking Questions

Before opening an issue, please search the
[issue tracker](https://github.com/Ally-Financial/soda/issues) to make sure
your issue hasn't already been reported.

### Bugs and Improvements/Features

We use the [issue tracker](https://github.com/Ally-Financial/soda/issues) to keep track of bugs and improvements to **Soda**
itself, its examples, and the documentation. We encourage you to open issues to
discuss improvements, architecture, theory, internal implementation, etc. If a
topic has been discussed before, we will ask you to join the previous
discussion.

#### Help Us Help You

When raising an issue to discuss, it is a good idea to structure your code and
question in a way that is easy to read to entice people to answer it. For
example, we encourage you to use syntax highlighting, indentation, and split
text in paragraphs.

#### Submitting a new feature

When submitting a new feature request or enhancement of an existing feature please review the following:

##### Is your feature request related to a problem

Please provide a clear and concise description of what you want and what your use case is.

##### Provide an example

Please include a snippets of the code of the new feature.

##### Describe the suggested enhancement

A clear and concise description of the enhancement to be added include a step-by-step guide if applicable. Add any other context or screenshots or animated GIFs about the feature request

##### Describe alternatives you've considered

A clear and concise description of any alternative solutions or features you've considered.

#### Reporting bugs

All issues are submitted within GitHub [issue tracker](https://github.com/Ally-Financial/soda/issues). Please check this before submitting a new issue.

##### Describe the bug

A clear and concise description of what the bug is.

##### Provide step-by-step guide on how to reproduce the bug

Steps to reproduce the behavior, please provide code snippets or a link to repository

##### Expected behavior

Please provide a description of the expected behavior

##### Screenshots

If applicable, add screenshots or animated GIFs to help explain your problem.

##### System information

Provide the system information which is not limited to the below:

```sh
OS: [e.g. macOS, Windows]
Version of Soda: [e.g. 2.9.0]
Node version:[e.g 14.15.2]
```

##### Security Bugs

Please review our Security Policy. Please follow the instructions outlined in the policy.

## Development

Visit the [issue tracker](https://github.com/Ally-Financial/soda/issues) to
find a list of open issues that need attention.

Fork, then clone the repo:

```sh
git clone https://github.com/your-username/soda.git
```

### Installation

#### Installing Soda

Running the `install`

```sh
npm install
```

### Running

#### Running Soda for web testing

After installing the node modules through npm, run the following commands:

In bash:

```sh
cd <SODA_PROJECT_ROOT>/src
./bin/soda chrome about:blank -f puppeteer -t <SODA_PROJECT_ROOT>/src/sample_project -e prod -p 1337 -x web -s my_suite -m my_module -dvc
```

In command prompt:
```sh
cd <SODA_PROJECT_ROOT>\src
.\bin\soda chrome about:blank -f puppeteer -t <SODA_PROJECT_ROOT>\src\sample_project -e prod -p 1337 -x web -s my_suite -m my_module -dvc
```

#### Using the Visual Editor

```sh
:ve
```

#### Running tests from the CLI

```sh
:r test <TEST_NAME>
```

### Docs

View the [readme](https://github.com/Ally-Financial/soda/blob/main/README.md) to get a
solid overview of Soda.

### Examples

Refer the [readme](https://github.com/Ally-Financial/soda/blob/main/README.md) and [sampleproject](https://github.com/Ally-Financial/soda/tree/main/src/sample_project).

### Coding conventions

Please follow the conventions as they exist in the project.

### Git Commit Guidelines

We follow conventional commits for git commit message formatting. These rules make it easier to review commit logs and improve contextual understanding of code changes. This also allows us to auto-generate the CHANGELOG from commit messages.

### Sending a Pull Request

For non-trivial changes, please open an issue with a proposal for a new feature
or refactoring before starting on the work. We don't want you to waste your
efforts on a pull request that we won't want to accept.

On the other hand, sometimes the best way to start a conversation _is_ to send a
pull request. Use your best judgement!

In general, the contribution workflow looks like this:

- Open a new issue in the
  [Issue tracker](https://github.com/Ally-Financial/soda/issues).
- Fork the repo.
- Create a new feature branch based off the `main` branch.
- Make sure all tests pass by running `npm test` and there are no linting errors.
- Submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including
unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon
as possible. We may suggest some changes or improvements.

Thank you for contributing!
