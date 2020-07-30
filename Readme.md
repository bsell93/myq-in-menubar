# MyQ Bitbar

## Installation

1. Install Homebrew (if not installed) https://brew.sh/
   `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`
2. Run `brew cask install bitbar` (Outlined here: https://github.com/matryer/bitbar#installing-bitbar)
3. Install Node LTS from https://nodejs.org/en/download/
4. Install yarn `brew install yarn`
5. Run yarn in this directory (gets dependencies) `yarn`
6. Rename `template.credentials.js` to `.credentials.js`
7. Add email and password for MyQ to `.credentials.js` file for the appropriate variables
8. Run Bitbar app and set plugin directory to this directory
