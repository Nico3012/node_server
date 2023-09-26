#base system
  #boot debian-amd64-netinst.iso #latest tested version: Debian 12
  #choose "Install" option in bootloader
  #choose "Geführt - gesamte Platte mit verschlüsseltem LVM" in "Festplatten partitionieren" menu
  #choose "Alle Dateien auf eine Partition, für Anfänger empfohlen" in "Festplatten partitionieren" menu
  #unselect everything in "Softwareauswahl" menu

#Linux command line
  #get ip
    server$ ip a

  #install ssh
    server$ apt install dropbear-initramfs openssh-server
    client$ apt install openssh-client
    server$ nano /etc/ssh/sshd_config
      PermitRootLogin yes
    server$ systemctl restart sshd.service
    server$ nano /etc/dropbear/initramfs/dropbear.conf
      DROPBEAR_OPTIONS="-j -k -s" # Disable local & remote port forwarding & Disable password logins
    client$ ssh-keygen -t rsa -f key
    client$ scp key.pub root@'IPV4':/etc/dropbear/initramfs/authorized_keys
    server$ update-initramfs -u
    server$ reboot
    #choose "always assign the same IPv4 address to this device" in your router settings

  #connect to server
    client$ ping 'IPV4'
    client$ ssh -i key root@'IPV4'
    #on "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!" run: client$ rm ~/.ssh/known_hosts
      ssh$ cryptroot-unlock
    client$ ssh root@'IPV4'

  #install service
    server$ apt install nodejs
    server$ nano /etc/systemd/system/'SERVICENAME'.service
      [Service]
      Type=simple
      User=root
      ExecStart=/usr/bin/node 'PATHTOFILE' #/file.mjs
      WorkingDirectory='FOLDERTOFILE' #/folder
      Restart=on-failture
      [Install]
      WantedBy=multi-user.target
    server$ systemctl enable 'SERVICENAME'.service
    server$ systemctl start 'SERVICENAME'.service
    #on update file run: server$ systemctl restart 'SERVICENAME'.service
