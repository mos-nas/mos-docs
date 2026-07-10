// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MOS-Docs',
  tagline: 'Modular Operating System for Servers and Homelabs',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.mos-official.net',
  baseUrl: '/',
  organizationName: 'mos-nas',
  projectName: 'mos-docs',
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@cmfcmf/docusaurus-search-local',
      {
        language: 'en',
        indexDocs: true,
        indexPages: true,
        indexBlog: false,
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // --- Section 0: Original site paths (pre-April 2026, no /docs/ prefix) ---
          { to: '/docs/API/MOS-API-Overview', from: '/API/API_Overview' },
          { to: '/docs/Installation/Create-Bootable-Media', from: '/Installation/Create_Bootable_Media' },
          { to: '/docs/', from: '/Introduction/Overview_of_the_OS' },
          { to: '/docs/Pools/Create-Storage-Pool', from: '/Quick_Start/Create_a_Storage_Pool' },
          { to: '/docs/Shares/Create-the-First-Shares', from: '/Quick_Start/Create_the_First_Shares' },
          { to: '/docs/Settings/Network/Network-Configuration', from: '/Quick_Start/Start_Network_Configuration' },
          { to: '/docs/Docker/Start-the-First-Container', from: '/Quick_Start/Start_the_First_Container' },
          { to: '/docs/Dashboard/WebUI-Overview', from: '/Quick_Start/WebUI_Overview' },
          { to: '/docs/Settings/System-Configuration/Cron-Jobs', from: '/System_Management/Cron_Jobs' },
          { to: '/docs/Settings/System-Configuration/Logs', from: '/System_Management/Logs' },
          { to: '/docs/MOS-Hub/MOS-Hub-Settings', from: '/System_Management/MOS_Hub_Settings' },
          { to: '/docs/Settings/User-Management/Users', from: '/User_&_Access_Management/Create_Users' },
          { to: '/docs/Advanced-Usage/Disable-MD5-Verification', from: '/Advanced_Usage/Disable_MD5_Verification' },
          { to: '/docs/Advanced-Usage/Docker-Local-Host-Access-Shim', from: '/Advanced_Usage/Docker_Local_Host_Access_Shim' },
          { to: '/docs/Advanced-Usage/System-Startup/Early-Boot-Script', from: '/Advanced_Usage/Early_Boot_Script' },
          { to: '/docs/Installation/Testing-MOS-in-a-Virtual-Machine', from: '/Installation/Testing_MOS_in_a_VM' },
          { to: '/docs/MOS-Hub/Creating-Your-Own-MOS-Hub-Repository', from: '/MOS_Hub/Create_Your_Own_MOS_Hub_Custom_Repository' },
          { to: '/docs/Plugins/MOS-Plugin-Development-Guide', from: '/Plugins/MOS_Plugin_Development_Guide' },
          { to: '/docs/Settings/Hardware/Boot', from: '/System_Management/Boot' },
          { to: '/docs/Docker/Docker-Service', from: '/System_Management/Docker_service' },
          { to: '/docs/Plugins/Drivers', from: '/System_Management/Drivers' },
          { to: '/docs/LXC/LXC-Service', from: '/System_Management/LXC_Service' },
          { to: '/docs/Settings/System-Configuration/Notifications', from: '/System_Management/MOS_Notify' },
          { to: '/docs/Settings/Hardware/Sensors', from: '/System_Management/Sensors' },
          { to: '/docs/Settings/System-Configuration/System', from: '/System_Management/System' },
          { to: '/docs/Settings/Network/Token', from: '/System_Management/Token' },
          { to: '/docs/VMs/VM-Service', from: '/System_Management/VM_service' },
          { to: '/docs/Pools/ZFS', from: '/System_Management/ZFS' },
          { to: '/docs/Advanced-Usage/System-Startup/Pool-Mount-Scripts', from: '/System_Startup/Pool_Mount_Scripts' },
          { to: '/docs/Advanced-Usage/System-Startup/Post-Start-Script', from: '/System_Startup/Post-Start_Script' },
          { to: '/docs/Advanced-Usage/System-Startup/Pre-Start-Script', from: '/System_Startup/Pre-Start_Script' },
          { to: '/docs/Settings/Network/Network-Ports', from: '/Introduction/Network_Ports_Used_by_MOS' },
          { to: '/docs/Advanced-Usage/System-Architecture', from: '/Introduction/System_Architecture' },

          // --- Section 1: Old underscore paths with /docs/ prefix (Jan-Apr 2026) ---
          { to: '/docs/API/MOS-API-Overview', from: '/docs/API/API_Overview' },
          { to: '/docs/API/MOS-API-Overview', from: '/docs/API/API' },
          { to: '/docs/Installation/Create-Bootable-Media', from: '/docs/Installation/Create_Bootable_Media' },
          { to: '/docs/', from: '/docs/Introduction/Overview_of_the_OS' },
          { to: '/docs/Pools/Create-Storage-Pool', from: '/docs/Quick_Start/Create_a_Storage_Pool' },
          { to: '/docs/Shares/Create-the-First-Shares', from: '/docs/Quick_Start/Create_the_First_Shares' },
          { to: '/docs/Settings/Network/Network-Configuration', from: '/docs/Quick_Start/Start_Network_Configuration' },
          { to: '/docs/Docker/Start-the-First-Container', from: '/docs/Quick_Start/Start_the_First_Container' },
          { to: '/docs/Dashboard/WebUI-Overview', from: '/docs/Quick_Start/WebUI_Overview' },
          { to: '/docs/Settings/System-Configuration/Cron-Jobs', from: '/docs/System_Management/Cron_Jobs' },
          { to: '/docs/Settings/System-Configuration/Logs', from: '/docs/System_Management/Logs' },
          { to: '/docs/MOS-Hub/MOS-Hub-Settings', from: '/docs/System_Management/MOS_Hub_Settings' },
          { to: '/docs/Settings/User-Management/Users', from: '/docs/User_&_Access_Management/Create_Users' },

          // --- Section 2: Old structure (Apr-Jun 2026) → WebUI structure ---
          { to: '/docs/Dashboard/WebUI-Overview', from: '/docs/Quick-Start/WebUI-Overview' },
          { to: '/docs/Disks/SMART', from: '/docs/System-Management/SMART' },
          { to: '/docs/Docker/Docker-Service', from: '/docs/Virtualization/Docker-Service' },
          { to: '/docs/Docker/Start-the-First-Container', from: '/docs/Quick-Start/Start-the-First-Container' },
          { to: '/docs/LXC/LXC-Service', from: '/docs/Virtualization/LXC-Service' },
          { to: '/docs/Plugins/Drivers', from: '/docs/System-Management/Drivers' },
          { to: '/docs/Plugins/MOS-Plugin-Development-Guide', from: '/docs/MOS-Hub/MOS-Plugin-Development-Guide' },
          { to: '/docs/Pools/Create-Storage-Pool', from: '/docs/Quick-Start/Create-Storage-Pool' },
          { to: '/docs/Pools/ZFS', from: '/docs/System-Management/ZFS' },
          { to: '/docs/Settings/Hardware/Boot', from: '/docs/System-Management/Boot' },
          { to: '/docs/Settings/System-Configuration/Cron-Jobs', from: '/docs/System-Management/System-Configuration/Cron-Jobs' },
          { to: '/docs/Settings/System-Configuration/Logs', from: '/docs/System-Management/System-Configuration/Logs' },
          { to: '/docs/MOS-Hub/MOS-Hub-Settings', from: '/docs/System-Management/System-Configuration/MOS-Hub' },
          { to: '/docs/Settings/Network/Network-Configuration', from: '/docs/Network/Network-Configuration' },
          { to: '/docs/Settings/Network/Network-Services', from: '/docs/Network/Network-Services' },
          { to: '/docs/Settings/Network/Network-Ports', from: '/docs/Network/Network-Ports' },
          { to: '/docs/Settings/System-Configuration/Notifications', from: '/docs/System-Management/System-Configuration/Notify' },
          { to: '/docs/Settings/Hardware/Sensors', from: '/docs/System-Management/System-Configuration/Sensors' },
          { to: '/docs/Settings/System-Configuration/System', from: '/docs/System-Management/System-Configuration/System-Settings' },
          { to: '/docs/Settings/Network/Token', from: '/docs/System-Management/System-Configuration/Token' },
          { to: '/docs/Settings/System/Update-System', from: '/docs/System-Management/System-Configuration/Update-System' },
          { to: '/docs/Settings/User-Management/User-Profile', from: '/docs/User-Management/User-Profile' },
          { to: '/docs/Settings/User-Management/Users', from: '/docs/User-Management/Users' },
          { to: '/docs/Shares/Create-the-First-Shares', from: '/docs/Quick-Start/Create-the-First-Shares' },
          { to: '/docs/VMs/Create-the-First-VM', from: '/docs/Quick-Start/Create-the-First-VM' },
          { to: '/docs/VMs/VM-Service', from: '/docs/Virtualization/VM-Service' },
          { to: '/docs/Settings/Network/Network-Configuration', from: '/docs/Quick-Start/Start-Network-Configuration' },
          { to: '/docs/Advanced-Usage/System-Startup/Early-Boot-Script', from: '/docs/Advanced-Usage/Early-Boot-Script' },
          { to: '/docs/Advanced-Usage/System-Startup/Mounted-Script', from: '/docs/System-Startup/Mounted-Script' },
          { to: '/docs/Advanced-Usage/System-Startup/Pool-Mount-Scripts', from: '/docs/System-Startup/Pool-Mount-Scripts' },
          { to: '/docs/Advanced-Usage/System-Startup/Post-Start-Script', from: '/docs/System-Startup/Post-Start-Script' },
          { to: '/docs/Advanced-Usage/System-Startup/Pre-Start-Script', from: '/docs/System-Startup/Pre-Start-Script' },

          // --- Section 3: Coming soon (add redirects for the upcoming restructure here) ---
          // { to: '/docs/NEW-PATH', from: '/docs/CURRENT-PATH' },
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/docs/',
          editUrl: 'https://github.com/mos-nas/mos-docs/edit/master/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    announcementBar: {
      id: 'release-0.5.0-stable',
      content: '🎉 <strong>MOS 0.5.0-stable is out!</strong> — First stable release! 🐧 Kernel 6.18.38, 📦 Node.js 24.18.0 LTS, Virtual Pools, SMART acknowledge, Plugins from Gitea/Codeberg &nbsp;<a href="https://docs.mos-official.net/docs/Release-Notes/Stable/0.5.0-stable" style="color:#ffffff;">Release Notes →</a>',
      backgroundColor: '#fa9725',
      textColor: '#ffffff',
      isCloseable: true,
    },
    image: 'img/mos-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MOS-Docs',
      logo: {
        alt: 'MOS Logo',
        src: 'img/mos_black.png',
        srcDark: 'img/mos_white.png',
        href: '/docs/',
      },
      items: [
        {
          href: 'https://github.com/mos-nas/mos-releases',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'MOS-Docs',
          items: [
            {
              label: 'Overview',
              href: '/docs/',
            },
            {
              label: 'MOS Website',
              href: 'https://mos-official.net',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.com/invite/fcTMbuygTV',
            },
            {
              label: 'Reddit',
              href: 'https://www.reddit.com/r/MOS_official_net/',
            },
            {
              label: 'X',
              href: 'https://x.com/mos_offi',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/mos-nas/mos-releases',
            },
            {
              label: 'GitHub Issue',
              href: 'https://github.com/mos-nas/mos-releases/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MOS-Docs. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
