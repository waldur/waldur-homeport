In order to enable monitoring you should install and configure Zabbix agent on monitored virtual machine.

Install repository configuration package:

```
# wget http://repo.zabbix.com/zabbix/3.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_3.0-1+xenial_all.deb
# dpkg -i zabbix-release_3.0-1+xenial_all.deb
# apt-get update
```

Install agent package:
```
# apt-get install zabbix-agent
```

Configure Zabbix agent by modifying `/etc/zabbix/zabbix_agentd.conf` file:
```
Server={ZABBIX_SERVER_IP}
ServerActive={ZABBIX_SERVER_IP}
Hostname={ZABBIX_CLIENT_ID}
```

Start and enable Zabbix agent:
```
systemctl start zabbix-agent
systemctl enable zabbix-agent
```
