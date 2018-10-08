1. Download pre-compiled Zabbix agent from <a target="_blank" href="https://www.zabbix.com/download_agents">official Zabbix download page</a> and manually install and start it using Command Prompt:
```
C:\Users\admin><full system path to zabbix_agentd.exe> --config <full system path to zabbix_agentd.win.conf> --install
```

2. Configure Zabbix agent by modifying `zabbix_agentd.win.conf` file:
```
Server={ZABBIX_SERVER_IP}
ServerActive={ZABBIX_SERVER_IP}
Hostname={ZABBIX_CLIENT_ID}
```

3. Start Zabbix agent:
```
C:\Users\admin><full system path to zabbix_agentd.exe> --start
```

4. Open Zabbix agent port in Windows firewall by clicking **Control Panel** -> **System and Security** –> **Windows Firewall** -> **Allow an app through Windows Firewall**. Next, click on **Allow another app** button and use the **Browse** button to select Zabbix agent executable file. Click **OK** button to finish and apply configuration.
