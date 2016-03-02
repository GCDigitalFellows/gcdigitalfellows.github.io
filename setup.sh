#!/bin/bash

#
# Helper functions
#
export PREFIX="${PREFIX:-/usr/local}"

function log() {
	if [[ -t 1 ]]; then
		printf "%b>>>%b %b%s%b\n" "\x1b[1m\x1b[32m" "\x1b[0m" \
		                          "\x1b[1m\x1b[37m" "$1" "\x1b[0m"
	else
		printf ">>> %s\n" "$1"
	fi
}

function error() {
	if [[ -t 1 ]]; then
		printf "%b!!!%b %b%s%b\n" "\x1b[1m\x1b[31m" "\x1b[0m" \
		                          "\x1b[1m\x1b[37m" "$1" "\x1b[0m" >&2
	else
		printf "!!! %s\n" "$1" >&2
	fi
}

function warning() {
	if [[ -t 1 ]]; then
		printf "%b***%b %b%s%b\n" "\x1b[1m\x1b[33m" "\x1b[0m" \
			                  "\x1b[1m\x1b[37m" "$1" "\x1b[0m" >&2
	else
		printf "*** %s\n" "$1" >&2
	fi
}

# helper confirmation function
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

reload_env () {
  #reload shell (first exit previous sub-shell)
  if [[ -d "$HOME/.bashrc" ]]; then
    source "$HOME/.bashrc"
  fi
  if [[ -d "$HOME/.profile" ]]; then
    source "$HOME/.profile"
  fi
  if [[ -d "$HOME/.zprofile" ]]; then
    source "$HOME/.zprofile"
  fi
  if [[ -d "$HOME/.zshrc" ]]; then
    source "$HOME/.zshrc"
  fi
  if [[ -d "$HOME/.zshenv" ]]; then
    source "$HOME/.zshenv"
  fi
}

cdx () {
  if [[ -d "$1" ]]; then
    cd "$1"
  else
    error "$1 does not exist. Exiting."
  fi
}

read -e -p "Please enter the *BASE* directory where you want to clone this project (it will create a new folder called gcdrb in this location): " CLONEDIR
cdx $CLONEDIR

# install homebrew on macs
if [[ `uname` == 'Darwin' ]]; then
  if ! type 'brew' > /dev/null 2>&1; then
    log ' + Installing Homebrew...'
    ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"
    brew update
  fi
fi

# install git command line
if ! type 'git' > /dev/null 2>&1; then
  if [[ `uname` == 'Darwin' ]]; then
    log "Installing git via homebrew"
    brew install git
  elif [[ `uname` == 'Linux' ]]; then
    if type 'apt-get' > /dev/null 2>&1; then
      log "Installing git via apt-get"
      sudo apt-get update
      sudo apt-get install git
    elif type 'yum' > /dev/null 2>&1; then
      log "Installing git via yum"
      sudo yum install git
    else
      error 'Please manually install git before proceeding'
      exit 0
    fi
  fi
fi

# install n and nodejs
if ! type 'npm' > /dev/null 2>&1; then
	if [[ `uname` == 'Darwin' ]]; then
	  log "Installing the latest version of node/npm via n"
		curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
	elif [[ `uname` == 'Linux' ]]; then
		if type 'apt-get' > /dev/null 2>&1; then
			curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
			sudo apt-get install -y nodejs
			sudo apt-get install -y build-essential
		elif type 'yum' > /dev/null 2>&1; then
			curl --silent --location https://rpm.nodesource.com/setup_5.x | bash -
			sudo yum -y install nodejs
			sudo yum groupinstall 'Development Tools'
		else
			error 'Please manually install node.js: https://nodejs.org/en/download/'
		fi
	fi
else
  warning 'Looks like n and npm are already installed. Please double check your system configuration to be sure that the correct versions of node/npm are being used and that it is included in your PATH.'
  warning '`which npm` should return something like "/usr/local/bin/npm" '
  warning 'Result of `which npm`:'
  which npm
  warning 'If the above output does not look correct, please uninstall npm and re-run this script.'
fi

# install chruby and ruby
if ! type 'chruby' > /dev/null 2>&1; then
  warning "I recommend using chruby (or rbenv, but not rvm) to manage your ruby environment."
  if (confirm "Should I install chruby/ruby-install for you [y/N]? "); then
    wget -O chruby-0.3.9.tar.gz https://github.com/postmodern/chruby/archive/v0.3.9.tar.gz
    tar -xzvf chruby-0.3.9.tar.gz
    cdx chruby-0.3.9
    if [[ -w "/usr/local/bin" ]]; then
      source scripts/setup.sh
    else
      warning "Trying to install chruby as root."
      sudo make install
      config="if [ -n \"\$BASH_VERSION\" ] || [ -n \"\$ZSH_VERSION\" ]; then
      	source $PREFIX/share/chruby/chruby.sh
      	source $PREFIX/share/chruby/auto.sh
      fi"

      if [[ -d /etc/profile.d/ ]]; then
      	# Bash/Zsh
      	echo "$config" > /etc/profile.d/chruby.sh
      	log "chruby setup complete!"
      else
      	warning "Could not determine where to add chruby configuration."
      	warning "Please add the following configuration where appropriate:"
      	echo
      	echo "$config"
      	echo
      fi
    fi
    cd ..
    rm -rf chruby-0.3.9 chruby-0.3.9.tar.gz

    # reload the shell to get chruby'ing
    reload_env
    log "Reinitializing the shell"
  fi
fi

if ! type 'ruby-install' > /dev/null 2>&1; then
  warning "It looks like you do not have ruby-install installed."
  if (confirm "Should I install ruby-install for you [y/N]? "); then
    # install ruby-install
    log "Installing ruby-install"
    wget -O ruby-install-0.5.0.tar.gz https://github.com/postmodern/ruby-install/archive/v0.5.0.tar.gz
    tar -xzvf ruby-install-0.5.0.tar.gz
    cdx ruby-install-0.5.0
    sudo make install
    cd ..
    rm -rf ruby-install-0.5.0 ruby-install-0.5.0.tar.gz
    log "Installed ruby-install!"
  else
    warning "Please be sure that you have installed the correct version of Ruby and that chruby is configured to use that version globally."
  fi
fi

if type 'ruby-install' > /dev/null 2>&1; then
  if (confirm "Should I try to install the latest version of ruby for you [y/N]?"); then
    ruby_latest=$(ruby-install | awk '/  ruby:/,/  jruby:/' | tail -2 | head -1)
    export ruby_latest
    ruby-install ruby "$ruby_latest"
    reload_env
    source $PREFIX/share/chruby/chruby.sh
    source $PREFIX/share/chruby/auto.sh
    chruby "$ruby_latest"
    log "Installed the latest version of ruby."
    warning "*** Please check that you have the command 'chruby $ruby_latest' somewhere in your .bashrc/.zshrc/.profile so that the correct version of ruby gets loaded when you start a new terminal."
  else
    warning "Please double check your ruby installation to be sure everything is configured correctly. I recommend against using the system ruby just to keep things clean."
  fi
else
  warning "ruby-install not found. Please double check your ruby installation to be sure everything is configured correctly. I recommend against using the system ruby just to keep things clean."
fi

warning "Finished installing the required tools to set up the development environment. Please open a *new* shell (needed to initialize some stuff) and run 'bash -c \"$(curl -L https://raw.githubusercontent.com/GCDigitalFellows/gcdrb/master/setup2.sh)\"'"
