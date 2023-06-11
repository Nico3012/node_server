#Linux command line
  $ apt install openssl
  $ openssl genrsa -aes256 -out ca.key 4096
  $ openssl req -new -x509 -sha256 -days 365 -key ca.key -out ca.pem

  $ openssl genrsa -out private.key 4096
  $ openssl req -new -sha256 -subj "/CN='YOURNAME'" -key private.key -out request.csr
  $ echo "subjectAltName=DNS:'YOURDOMAIN',DNS:'YOURDOMAIN',IP:'YOURIPADDRESS'" >> config.ext
  $ openssl x509 -req -sha256 -days 365 -in request.csr -CA ca.pem -CAkey ca.key -out public.crt -extfile config.ext -CAcreateserial

#Install
  #ios
    #click ca.pem to load
    #install ca.pem in settings: "VPN und Geräteverwaltung"
    #enable ca.pem in settings: "Zertifikatsvertrauenseinstellungen"
  #android
    #click "Von USB-Speicher installieren" in settings: "Zertifikatverwaltungs-App"
    #choose "CA-Zertifikat"
    #select ca.pem
  #windows
    #open cmd in ca.pem's directory as administrator
    #run "certutil.exe -addstore root ca.pem"
