In order to enable monitoring you should install and configure Zabbix agent on monitored virtual machine.

Install repository configuration package:

```
# yum install https://repo.zabbix.com/zabbix/3.0/rhel/7/x86_64/zabbix-release-3.0-1.el7.noarch.rpm
```

Install agent package:
```
# yum install zabbix-agent
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
