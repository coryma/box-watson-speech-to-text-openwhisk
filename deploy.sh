# Load configuration variables
source local.env

function usage() {
  echo -e "Usage: $0 [--install,--uninstall,--env]"
}

function install() {

  echo "Deploy the package"

  npx babel src --out-dir dist
  zip -rq action.zip *
  WATSON_USER_NAME=$WATSON_USER_NAME WATSON_PASSWORD=$WATSON_PASSWORD BOX_CONFIG=$BOX_CONFIG BOX_USER_ID=$BOX_USER_ID wskdeploy -p .
  
  echo -e "Install Complete"
}

function uninstall() {
  echo -e "Uninstalling..."

   wskdeploy undeploy

  echo -e "Uninstall Complete"
}

case "$1" in
"--install" )
install
;;
"--uninstall" )
uninstall
;;
* )
usage
;;
esac
