#Linux command line
  #install certbot
    server$ apt install certbot
    server$ certbot certonly --standalone
      #cert: /etc/letsencrypt/live/'YOURDOMAIN'/fullchain.pem #dont move away!
      #key: /etc/letsencrypt/live/'YOURDOMAIN'/privkey.pem #dont move away!

  #renew cert
    server$ #stop http:80 and https:443 services
    server$ certbot renew
    server$ #start http:80 and https:443 services

  #remove cert
    server$ certbot delete
