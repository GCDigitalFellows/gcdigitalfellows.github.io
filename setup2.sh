#!/bin/bash
function confirm () {
    # call with a prompt string or use a default
    read -r -p "${1:-Are you sure? [y/N]} " response
    case $response in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# install rubygems
if ! type 'gem' > /dev/null 2>&1; then
  log "Installing rubygems"
  git clone https://github.com/rubygems/rubygems.git
  cdx rubygems
  ruby setup.rb
  cd .. > /dev/null 2>&1
  rm -rf rubygems
  log "Rubygems was Installed"
fi
# install bundler
if ! type 'bundle' > /dev/null 2>&1; then
  log "Installing bundler"
  gem install bundler
  log "Bundler was installed"
fi

log "Installing bower globally (if it dooesn't work, you might need to run this as root)"
npm install -g bower

if [[ -d "./gcdrb" ]]; then
  cd gcdrb
else
  git clone https://github.com/GCDigitalFellows/gcdrb.git
  cd gcdrb || exit
fi

log "Installing NPM dependencies"
npm install
log "Installing Bower dependencies"
bower install
log "Installing Ruby dependencies"
bundle install

log "Installation complete! Run 'npm run serve' to build the site and view it on your local computer."
