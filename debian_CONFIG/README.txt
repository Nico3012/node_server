#base system
  #remove network-device in router
  #boot debian-amd64-netinst.iso
  #choose "Install" option in bootloader
  #choose "Guided - use entire disk and setup encrypted LVM" in "Partition disks" menu
  #deselect everything in "Software selection" menu

#Linux command line
  #get ip
    server$ ip a

  #install ssh
    server$ apt install dropbear-initramfs openssh-server
    client$ apt install openssh-client
    server$ nano /etc/ssh/sshd_config
      PermitRootLogin yes
    server$ systemctl restart sshd.service
    server$ nano /etc/dropbear-initramfs/config
      DROPBEAR_OPTIONS="-j -k -s"
    client$ ssh-keygen -t rsa -f key
    client$ scp key.pub root@'IPV4':/etc/dropbear-initramfs/authorized_keys
    server$ update-initramfs -u
    server$ reboot
    #choose "always assign the same IPv4 address to this device" in your router settings

  #connect to server
    client$ ping 'IPV4'
    client$ ssh -i key root@'IPV4'
    #on "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED" run: client$ rm ~/.ssh/known_hosts
      ssh$ cryptroot-unlock
    client$ ssh root@'IPV4'

  #upload from ./root/* to /root/*
    client$ ssh root@'IPV4' "rm -r /root/*"
    client$ scp -r ./root/* root@'IPV4':/root/

  #install node
    server$ apt install curl
    server$ curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && apt install nodejs
    server$ nano /etc/systemd/system/'SERVICENAME'.service
      [Service]
      Type=simple
      User=root
      ExecStart=/usr/bin/node /'PATHTOFILE' ('.js')
      WorkingDirectory=/'FOLDERTOFILE' ('/')
      Restart=on-failture
      [Install]
      WantedBy=multi-user.target
    server$ systemctl enable 'SERVICENAME'.service
    server$ systemctl start 'SERVICENAME'.service
    #on update file run: server$ systemctl restart 'SERVICENAME'.service
