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
      id: 'release-0.4.7-beta',
      content: '🚀 <strong>MOS 0.4.7-beta is out!</strong> — Kernel 6.18.34, 📦 SnapRAID v14.5, 🔌 Socket-based API, 💾 Hugepages support, 🖥️ iSCSI WebUI &nbsp;<a href="https://docs.mos-official.net/docs/Release-Notes/Beta/0.4.7-beta" style="color:#ffffff;">Release Notes →</a>',
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
