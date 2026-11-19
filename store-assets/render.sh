#!/bin/sh
# Render every scene in store.html to PNG with headless Brave/Chromium.
cd "$(dirname "$0")"
B=${BROWSER:-brave}
r() { "$B" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --force-device-scale-factor=1 --virtual-time-budget=6000 --window-size="$2" \
  --screenshot="$PWD/$3.png" "file://$PWD/store.html#$1" 2>/dev/null; }
r hero    1280,800 1-hero
r compare 1280,800 2-before-after
r keys    1280,800 3-shortcut
r click   1280,800 4-click-chats
r popup   1280,800 5-settings
r private 1280,800 6-private
r tile    440,280  promo-small-440x280
r marquee 1400,560 promo-marquee-1400x560
