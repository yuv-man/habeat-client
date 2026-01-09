# CocoaPods Installation Guide

## Option 1: Using Homebrew (Recommended)

```bash
brew install cocoapods
```

This will install CocoaPods with the correct Ruby version automatically.

## Option 2: Using sudo (if Homebrew doesn't work)

```bash
sudo gem install cocoapods
```

You'll be prompted for your password.

## Option 3: Using rbenv/rvm (for Ruby version management)

If you have rbenv or rvm installed:

```bash
# With rbenv
rbenv install 3.0.0
rbenv global 3.0.0
gem install cocoapods

# With rvm
rvm install 3.0.0
rvm use 3.0.0
gem install cocoapods
```

## Verify Installation

After installation, verify CocoaPods is installed:

```bash
pod --version
```

## Install iOS Dependencies

Once CocoaPods is installed, run:

```bash
npm run ios:pod:install
```

Or manually:

```bash
cd ios/App
pod install
cd ../..
```

## Troubleshooting

### "pod: command not found"

If you installed with `--user-install`, add to your `~/.zshrc`:

```bash
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
```

Then reload:

```bash
source ~/.zshrc
```

### Ruby Version Issues

If you see Ruby version errors, use Homebrew to install CocoaPods (Option 1) as it handles Ruby dependencies automatically.
