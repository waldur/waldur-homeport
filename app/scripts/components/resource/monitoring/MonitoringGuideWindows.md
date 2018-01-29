In order to enable monitoring you should install and configure Zabbix agent on monitored virtual machine.

The pre-compiled zip agents for Windows environments can be obtained from <a target="_blank" href="https://www.zabbix.com/download_agents">official Zabbix download page</a> and manually installed and started on the system using windows Command Prompt as in the following example:
```
C:\Users\admin><full system path to zabbix_agentd.exe> --config <full system path to zabbix_agentd.win.conf> --install
```

Configure Zabbix agent by modifying `zabbix_agentd.win.conf` file:
```
Server={ZABBIX_SERVER_IP}
ServerActive={ZABBIX_SERVER_IP}
Hostname={ZABBIX_CLIENT_ID}
```

Now agent is ready to be started by:
```
C:\Users\admin><full system path to zabbix_agentd.exe> --start
```
