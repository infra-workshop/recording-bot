# create a temporary named pipe
PIPE=$(mktemp -u)
mkfifo "$PIPE"

Xvfb -displayfd 3 -screen 0 2000x1500x24 3>"$PIPE" &
XVFB_PID=$!

DISPLAY=":$(cat "$PIPE")"

echo "DISPLAY:" "$DISPLAY"

node ./dist/node/discord-controller/main.js "$DISPLAY"

kill $XVFB_PID
