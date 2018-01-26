In order to enable monitoring you should install and configure Zabbix agent on monitored virtual machine.

First you need to install repository configuration package using the following command:

```
yum install https://repo.zabbix.com/zabbix/3.0/rhel/7/x86_64/zabbix-release-3.0-1.el7.noarch.rpm
```

Then you should install agent package by running following command:
```
yum install zabbix-agent
```

The next step is to configure Zabbix agent:
```
nano /etc/zabbix/zabbix_agentd.conf
```

Please add Zabbix server IP address and hostname as shown below.
```
Server=IP of Zabbix Server
ServerActive=IP of Zabbix Server
Hostname=use the FQDN of the node where the agent runs
```

Now agent is ready to be started by:
```
systemctl start zabbix-agent
```
