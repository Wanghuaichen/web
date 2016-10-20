#!/bin/sh
cd /home/root
rm quark-init.sh
rm c801.gz
rm boot_app.gz
wget ftp://vxworks:vxworks@192.168.11.202/quark-init.sh
wget ftp://vxworks:vxworks@192.168.11.202/c801.gz
wget ftp://vxworks:vxworks@192.168.11.202/boot_app.gz
mkdir /media/realroot/app
mkdir /media/realroot/app/image0
mkdir /media/realroot/app/image1
cp /home/root/boot_app.gz /media/realroot/app
cp /home/root/c801.gz /media/realroot/app/image0/
cp /home/root/c801.gz /media/realroot/app/image1/
cp /home/root/quark-init.sh /etc/init.d/
sync
sleep 5
sync
sleep 2
sync


