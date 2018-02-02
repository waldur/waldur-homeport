1. Install repository configuration package:
```
# yum install https://repo.zabbix.com/zabbix/3.0/rhel/7/x86_64/zabbix-release-3.0-1.el7.noarch.rpm
```

2. Install agent package:
```
# yum install zabbix-agent
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
