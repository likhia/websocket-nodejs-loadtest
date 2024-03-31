## Run server.js using pm2

* Configure OS according to https://socket.io/docs/v4/performance-tuning/#at-the-os-level.

* if pm2 is installed,  delete all processes that are running in pm2 and npm remove -g pm2

* npm install -g @socket.io/pm2

* pm2 start server.js -i 30

## Run the scripts under k6 in another VM. 
* k6 run wsFind.js --vus 500 --duration 900s

* k6 run wsModify.js --vus 500 --duration 900s

