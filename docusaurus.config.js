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
  organizationName: 'ich777',
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
          // --- Section 1: Old underscore paths (Jan 2026) ---
          { to: '/docs/API/MOS-API-Overview', from: '/docs/API/API_Overview' },
          { to: '/docs/Installation/Create-Bootable-Media', from: '/docs/Installation/Create_Bootable_Media' },
          { to: '/docs/intro', from: '/docs/Introduction/Overview_of_the_OS' },
          { to: '/docs/Quick-Start/Create-Storage-Pool', from: '/docs/Quick_Start/Create_a_Storage_Pool' },
          { to: '/docs/Quick-Start/Create-the-First-Shares', from: '/docs/Quick_Start/Create_the_First_Shares' },
          { to: '/docs/Quick-Start/Start-Network-Configuration', from: '/docs/Quick_Start/Start_Network_Configuration' },
          { to: '/docs/Quick-Start/Start-the-First-Container', from: '/docs/Quick_Start/Start_the_First_Container' },
          { to: '/docs/Quick-Start/WebUI-Overview', from: '/docs/Quick_Start/WebUI_Overview' },
          { to: '/docs/System-Management/System-Configuration/Cron-Jobs', from: '/docs/System_Management/Cron_Jobs' },
          { to: '/docs/System-Management/System-Configuration/Logs', from: '/docs/System_Management/Logs' },
          { to: '/docs/System-Management/System-Configuration/MOS-Hub', from: '/docs/System_Management/MOS_Hub_Settings' },
          { to: '/docs/User-Management/Users', from: '/docs/User_&_Access_Management/Create_Users' },

          // --- Section 2: Old staging structure (Dashboard/Disks/Docker/...) ---
          { to: '/docs/Quick-Start/WebUI-Overview', from: '/docs/Dashboard/WebUI-Overview' },
          { to: '/docs/System-Management/SMART', from: '/docs/Disks/SMART' },
          { to: '/docs/Virtualization/Docker-Service', from: '/docs/Docker/Docker-Service' },
          { to: '/docs/Quick-Start/Start-the-First-Container', from: '/docs/Docker/Start-the-First-Container' },
          { to: '/docs/Virtualization/LXC-Service', from: '/docs/LXC/LXC-Service' },
          { to: '/docs/System-Management/Drivers', from: '/docs/Plugins/Drivers' },
          { to: '/docs/MOS-Hub/MOS-Plugin-Development-Guide', from: '/docs/Plugins/MOS-Plugin-Development-Guide' },
          { to: '/docs/Quick-Start/Create-Storage-Pool', from: '/docs/Pools/Create-Storage-Pool' },
          { to: '/docs/System-Management/ZFS', from: '/docs/Pools/ZFS' },
          { to: '/docs/System-Management/Boot', from: '/docs/Settings/Boot' },
          { to: '/docs/System-Management/System-Configuration/Cron-Jobs', from: '/docs/Settings/Cron-Jobs' },
          { to: '/docs/System-Management/System-Configuration/Logs', from: '/docs/Settings/Logs' },
          { to: '/docs/Network/Network-Configuration', from: '/docs/Settings/Network/Network-Configuration' },
          { to: '/docs/Network/Network-Services', from: '/docs/Settings/Network/Network-Services' },
          { to: '/docs/System-Management/System-Configuration/Notify', from: '/docs/Settings/Notify' },
          { to: '/docs/System-Management/System-Configuration/Sensors', from: '/docs/Settings/Sensors' },
          { to: '/docs/System-Management/System-Configuration/System-Settings', from: '/docs/Settings/System-Settings' },
          { to: '/docs/System-Management/System-Configuration/Token', from: '/docs/Settings/Token' },
          { to: '/docs/System-Management/System-Configuration/Update-System', from: '/docs/Settings/Update-System' },
          { to: '/docs/User-Management/User-Profile', from: '/docs/Settings/User-Management/User-Profile' },
          { to: '/docs/User-Management/Users', from: '/docs/Settings/User-Management/Users' },
          { to: '/docs/Quick-Start/Create-the-First-Shares', from: '/docs/Shares/Create-the-First-Shares' },
          { to: '/docs/Quick-Start/Create-the-First-VM', from: '/docs/VMs/Create-the-First-VM' },
          { to: '/docs/Virtualization/VM-Service', from: '/docs/VMs/VM-Service' },
          { to: '/docs/System-Management/System-Configuration/MOS-Hub', from: '/docs/MOS-Hub/MOS-Hub-Settings' },
          { to: '/docs/Advanced-Usage/Early-Boot-Script', from: '/docs/Advanced-Usage/System-Startup/Early-Boot-Script' },
          { to: '/docs/System-Startup/Mounted-Script', from: '/docs/Advanced-Usage/System-Startup/Mounted-Script' },
          { to: '/docs/System-Startup/Pool-Mount-Scripts', from: '/docs/Advanced-Usage/System-Startup/Pool-Mount-Scripts' },
          { to: '/docs/System-Startup/Post-Start-Script', from: '/docs/Advanced-Usage/System-Startup/Post-Start-Script' },
          { to: '/docs/System-Startup/Pre-Start-Script', from: '/docs/Advanced-Usage/System-Startup/Pre-Start-Script' },

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
          editUrl: 'https://github.com/ich777/mos-docs/edit/master/',
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
      id: 'release-0.4.11-beta',
      content: '🚀 <strong>MOS 0.4.11-beta is out!</strong> — 🐧 Kernel 6.18.37, 🐳 Docker v29.6.1, 📦 MergerFS Virtual Pools, Hub & Docker Group improvements &nbsp;<a href="https://docs.mos-official.net/docs/Release-Notes/Beta/0.4.11-beta" style="color:#ffffff;">Release Notes →</a>',
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
          href: 'https://github.com/ich777/mos-releases',
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
              href: 'https://github.com/ich777/mos-releases',
            },
            {
              label: 'GitHub Issue',
              href: 'https://github.com/ich777/mos-releases/issues',
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
