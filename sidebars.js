const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '📚 Welcome to MOS-Docs',
    },
    {
      type: 'category',
      label: '📦 Installation',
      items: [
        { type: 'doc', id: 'Installation/Create-Bootable-Media', label: 'Create Bootable Media' },
        { type: 'doc', id: 'Installation/Testing-MOS-in-a-Virtual-Machine', label: 'Testing MOS in a Virtual Machine' },
        { type: 'doc', id: 'Installation/First-Walkthrough', label: 'First Walkthrough' },
        { type: 'doc', id: 'Installation/ARM-Support', label: 'ARM Support (Experimental)' },
      ],
    },
    {
      type: 'category',
      label: '🧭 Getting Started',
      items: [
        { type: 'doc', id: 'Quick-Start/WebUI-Overview', label: 'WebUI Overview' },
        { type: 'doc', id: 'Quick-Start/Start-Network-Configuration', label: 'Start Network Configuration' },
        { type: 'doc', id: 'Quick-Start/Create-Storage-Pool', label: 'Create a Storage Pool' },
        { type: 'doc', id: 'Quick-Start/Start-the-First-Container', label: 'Start the First Container' },
        { type: 'doc', id: 'Quick-Start/Create-the-First-Shares', label: 'Create the First Shares' },
        { type: 'doc', id: 'Quick-Start/Create-the-First-VM', label: 'Create the First VM' },
      ],
    },
    {
      type: 'category',
      label: '⚙️ System Management',
      items: [
        { type: 'doc', id: 'System-Management/Boot', label: 'Boot' },
        { type: 'doc', id: 'System-Management/Drivers', label: 'Drivers' },
        { type: 'doc', id: 'System-Management/ZFS', label: 'ZFS' },
        { type: 'doc', id: 'System-Management/SMART', label: 'S.M.A.R.T.' },
        {
          type: 'category',
          label: '💻 System Configuration',
          items: [
            { type: 'doc', id: 'System-Management/System-Configuration/System-Settings', label: 'System Settings' },
            { type: 'doc', id: 'System-Management/System-Configuration/Update-System', label: 'Update System' },
            { type: 'doc', id: 'System-Management/System-Configuration/Cron-Jobs', label: 'Cron Jobs' },
            { type: 'doc', id: 'System-Management/System-Configuration/Logs', label: 'Logs' },
            { type: 'doc', id: 'System-Management/System-Configuration/MOS-Hub', label: 'MOS-Hub' },
            { type: 'doc', id: 'System-Management/System-Configuration/Notify', label: 'Notify' },
            { type: 'doc', id: 'System-Management/System-Configuration/Sensors', label: 'Sensors' },
            { type: 'doc', id: 'System-Management/System-Configuration/Token', label: 'Token' },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '👤 User Management',
      items: [
        { type: 'doc', id: 'User-Management/Users', label: 'Users' },
        { type: 'doc', id: 'User-Management/User-Profile', label: 'User Profile' },
      ],
    },
    {
      type: 'category',
      label: '🚀 System Startup',
      items: [
        { type: 'doc', id: 'System-Startup/Pre-Start-Script', label: 'Pre-Start Script' },
        { type: 'doc', id: 'System-Startup/Post-Start-Script', label: 'Post-Start Script' },
        { type: 'doc', id: 'System-Startup/Pool-Mount-Scripts', label: 'Pool Mount Scripts' },
      ],
    },
    {
      type: 'category',
      label: '🗂️ Virtualization',
      items: [
        { type: 'doc', id: 'Virtualization/Docker-Service', label: 'Docker Service' },
        { type: 'doc', id: 'Virtualization/LXC-Service', label: 'LXC Service' },
        { type: 'doc', id: 'Virtualization/VM-Service', label: 'VM Service' },
      ],
    },
    {
      type: 'category',
      label: '🌐 Network',
      items: [
        { type: 'doc', id: 'Network/Network-Configuration', label: 'Network Configuration' },
        { type: 'doc', id: 'Network/Network-Services', label: 'Network Services' },
      ],
    },
    {
      type: 'category',
      label: '🔌 API',
      items: [
        { type: 'doc', id: 'API/MOS-API-Overview', label: 'MOS API Overview' },
        { type: 'doc', id: 'API/Rate-Limits', label: 'Rate Limits' },
      ],
    },
    {
      type: 'category',
      label: '🛍️ MOS Hub',
      items: [
        { type: 'doc', id: 'MOS-Hub/Creating-Your-Own-MOS-Hub-Repository', label: 'Creating Your Own MOS Hub Repository' },
        { type: 'doc', id: 'MOS-Hub/MOS-Plugin-Development-Guide', label: 'MOS Plugin Development Guide' },
      ],
    },
    {
      type: 'category',
      label: '📖 Advanced Usage',
      items: [
        { type: 'doc', id: 'Advanced-Usage/Docker-Local-Host-Access-Shim', label: 'Docker Local Host Access' },
        { type: 'doc', id: 'Advanced-Usage/Disable-MD5-Verification', label: 'Disable MD5 Verification' },
        { type: 'doc', id: 'Advanced-Usage/Early-Boot-Script', label: 'Early Boot Script' },
        { type: 'doc', id: 'Advanced-Usage/Persistent-Package-Installation', label: 'Persistent Package Installation' },
        { type: 'doc', id: 'Advanced-Usage/Kernel-Module-Configuration', label: 'Kernel Module Configuration' },
      ],
    },
    {
      type: 'category',
      label: '🛠️ Troubleshooting',
      items: [
        { type: 'doc', id: 'Troubleshooting/Troubleshooting', label: 'Troubleshooting' },
        { type: 'doc', id: 'Troubleshooting/Diagnostics', label: 'Diagnostics' },
      ],
    },
    {
      type: 'category',
      label: '📋 Release Notes',
      items: [
        { type: 'doc', id: 'Release-Notes/Overview', label: 'Overview' },
        {
          type: 'category',
          label: '🧪 Beta',
          items: [
            { type: 'doc', id: 'Release-Notes/Beta/0.4.2-beta', label: '0.4.2-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.1-beta', label: '0.4.1-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.0-beta', label: '0.4.0-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.3.0-beta', label: '0.3.0-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.2.4-beta', label: '0.2.4-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.2.3-beta', label: '0.2.3-beta' },
          ],
        },
      ],
    },
  ],
};
export default sidebars;
