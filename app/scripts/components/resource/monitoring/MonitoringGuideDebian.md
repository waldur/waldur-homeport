1. Install repository configuration package:
```
# For Debian 9 (codename: stretch)
# wget http://repo.zabbix.com/zabbix/3.0/debian/pool/main/z/zabbix-release/zabbix-release_3.0-2+stretch_all.deb
# dpkg -i zabbix-release_3.0-2+stretch_all.deb
# apt-get update
# For Debian 8 change 'stretch' to 'jessie'.
# For Debian 7 change 'stretch' to 'wheezy'.
#
# For Ubuntu 16.04 LTS (codename: xenial):
# wget http://repo.zabbix.com/zabbix/3.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_3.0-1+xenial_all.deb
# dpkg -i zabbix-release_3.0-1+xenial_all.deb
# apt-get update
# For Ubuntu 14.04 LTS change 'xenial' to 'trusty'.
```

2. Install agent package:
```
# apt-get install zabbix-agent
```

3. Configure Zabbix agent by modifying `/etc/zabbix/zabbix_agentd.conf` file:
```
Server={ZABBIX_SERVER_IP}
ServerActive={ZABBIX_SERVER_IP}
Hostname={ZABBIX_CLIENT_ID}
```

4. Start and enable Zabbix agent:
```
systemctl start zabbix-agent
systemctl enable zabbix-agent
```
