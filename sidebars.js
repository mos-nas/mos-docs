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
        { type: 'doc', id: 'Installation/Create-Bootable-Media', label: '💿 Create Bootable Media' },
        { type: 'doc', id: 'Installation/First-Walkthrough', label: '🚀 First Walkthrough' },
        { type: 'doc', id: 'Installation/Testing-MOS-in-a-Virtual-Machine', label: '🖥️ Testing MOS in a Virtual Machine' },
        { type: 'doc', id: 'Installation/ARM-Support', label: '🍓 ARM Support (Experimental)' },
      ],
    },
    {
      type: 'category',
      label: '🖥️ Dashboard',
      items: [
        { type: 'doc', id: 'Dashboard/WebUI-Overview', label: '👀 WebUI Overview' },
      ],
    },
    {
      type: 'category',
      label: '💾 Disks',
      items: [
        { type: 'doc', id: 'Disks/SMART', label: '📊 S.M.A.R.T.' },
      ],
    },
    {
      type: 'category',
      label: '🗄️ Pools',
      items: [
        { type: 'doc', id: 'Pools/Create-Storage-Pool', label: '🆕 Create a Storage Pool' },
        { type: 'doc', id: 'Pools/ZFS', label: '🐟 ZFS' },
      ],
    },
    {
      type: 'category',
      label: '📂 Shares',
      items: [
        { type: 'doc', id: 'Shares/Create-the-First-Shares', label: '✨ Create the First Shares' },
      ],
    },
    {
      type: 'category',
      label: '🛍️ MOS Hub',
      items: [
        { type: 'doc', id: 'MOS-Hub/MOS-Hub-Settings', label: '⚙️ MOS Hub Settings' },
        { type: 'doc', id: 'MOS-Hub/Creating-Your-Own-MOS-Hub-Repository', label: '🔧 Creating Your Own MOS Hub Repository' },
      ],
    },
    {
      type: 'category',
      label: '🐳 Docker',
      items: [
        { type: 'doc', id: 'Docker/Docker-Service', label: '🔧 Docker Service' },
        { type: 'doc', id: 'Docker/Start-the-First-Container', label: '🚀 Start the First Container' },
      ],
    },
    {
      type: 'category',
      label: '📦 LXC',
      items: [
        { type: 'doc', id: 'LXC/LXC-Service', label: '🔧 LXC Service' },
      ],
    },
    {
      type: 'category',
      label: '🖥️ VMs',
      items: [
        { type: 'doc', id: 'VMs/VM-Service', label: '🔧 VM Service' },
        { type: 'doc', id: 'VMs/Create-the-First-VM', label: '🚀 Create the First VM' },
      ],
    },
    {
      type: 'category',
      label: '🧩 Plugins & Drivers',
      items: [
        { type: 'doc', id: 'Plugins/Drivers', label: '🖥️ Drivers' },
        { type: 'doc', id: 'Plugins/MOS-Plugin-Development-Guide', label: '📦 MOS Plugin Development Guide' },
      ],
    },
    {
      type: 'category',
      label: '⚙️ Settings',
      items: [
        { type: 'doc', id: 'Settings/System-Settings', label: '🖥️ System Settings' },
        { type: 'doc', id: 'Settings/Update-System', label: '🔄 Update System' },
        { type: 'doc', id: 'Settings/Boot', label: '💾 Boot' },
        { type: 'doc', id: 'Settings/Cron-Jobs', label: '⏰ Cron Jobs' },
        { type: 'doc', id: 'Settings/Logs', label: '📋 Logs' },
        { type: 'doc', id: 'Settings/Notify', label: '🔔 Notify' },
        { type: 'doc', id: 'Settings/Sensors', label: '🌡️ Sensors' },
        { type: 'doc', id: 'Settings/Token', label: '🔑 Token' },
        {
          type: 'category',
          label: '🌐 Network',
          items: [
            { type: 'doc', id: 'Settings/Network/Network-Configuration', label: '🔧 Network Configuration' },
            { type: 'doc', id: 'Settings/Network/Network-Services', label: '🔌 Network Services' },
            { type: 'doc', id: 'Settings/Network/Network-Ports', label: '📡 Network Ports' },
          ],
        },
        {
          type: 'category',
          label: '👤 User Management',
          items: [
            { type: 'doc', id: 'Settings/User-Management/Users', label: '👥 Users' },
            { type: 'doc', id: 'Settings/User-Management/User-Profile', label: '🪪 User Profile' },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '🔌 API',
      items: [
        { type: 'doc', id: 'API/MOS-API-Overview', label: '📖 MOS API Overview' },
        { type: 'doc', id: 'API/Rate-Limits', label: '⏱️ Rate Limits' },
      ],
    },
    {
      type: 'category',
      label: '📖 Advanced Usage',
      items: [
        { type: 'doc', id: 'Advanced-Usage/System-Architecture', label: '🧠 System Architecture' },
        { type: 'doc', id: 'Advanced-Usage/Docker-Local-Host-Access-Shim', label: '🐳 Docker Local Host Access' },
        { type: 'doc', id: 'Advanced-Usage/Disable-MD5-Verification', label: '🔓 Disable MD5 Verification' },
        { type: 'doc', id: 'Advanced-Usage/Persistent-Package-Installation', label: '📦 Persistent Package Installation' },
        { type: 'doc', id: 'Advanced-Usage/Kernel-Module-Configuration', label: '🔧 Kernel Module Configuration' },
        { type: 'doc', id: 'Advanced-Usage/Bash-Profile-Configuration', label: '💻 Bash Profile Configuration' },
        {
          type: 'category',
          label: '🚀 System Startup',
          items: [
            { type: 'doc', id: 'Advanced-Usage/System-Startup/Early-Boot-Script', label: '⚡ Early Boot Script' },
            { type: 'doc', id: 'Advanced-Usage/System-Startup/Pre-Start-Script', label: '🏁 Pre-Start Script' },
            { type: 'doc', id: 'Advanced-Usage/System-Startup/Mounted-Script', label: '🔗 Mounted Script' },
            { type: 'doc', id: 'Advanced-Usage/System-Startup/Post-Start-Script', label: '✅ Post-Start Script' },
            { type: 'doc', id: 'Advanced-Usage/System-Startup/Pool-Mount-Scripts', label: '🗄️ Pool Mount Scripts' },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '🛠️ Troubleshooting',
      items: [
        { type: 'doc', id: 'Troubleshooting/Troubleshooting', label: '🔧 Troubleshooting' },
        { type: 'doc', id: 'Troubleshooting/Diagnostics', label: '🩺 Diagnostics' },
      ],
    },
    {
      type: 'category',
      label: '🌟 Support MOS',
      items: [
        { type: 'doc', id: 'Support-MOS/Support_MOS', label: '🌟 Support MOS' },
      ],
    },
    {
      type: 'category',
      label: '📋 Release Notes',
      items: [
        { type: 'doc', id: 'Release-Notes/Overview', label: '📖 Overview' },
        {
          type: 'category',
          label: '🧪 Beta',
          items: [
            { type: 'doc', id: 'Release-Notes/Beta/0.4.11-beta', label: '0.4.11-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.10-beta', label: '0.4.10-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.9-beta', label: '0.4.9-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.8-beta', label: '0.4.8-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.7-beta', label: '0.4.7-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.6-beta', label: '0.4.6-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.5-beta', label: '0.4.5-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.4-beta', label: '0.4.4-beta' },
            { type: 'doc', id: 'Release-Notes/Beta/0.4.3-beta', label: '0.4.3-beta' },
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
