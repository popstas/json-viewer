#!/bin/bash
set -eu

ssh popstas@popstas-server "cd /home/popstas/projects/js/viasite-projects-list/ && git pull && npm i && npm run generate && rsync -r dist/ viasite@dev.viasite.ru:/home/viasite/www/dev.viasite.ru/viasite-projects/"
