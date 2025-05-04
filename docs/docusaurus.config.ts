import type * as Preset from "@docusaurus/preset-classic"
import type { Config } from "@docusaurus/types"
import { themes as prismThemes } from "prism-react-renderer"

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "Bustle Documentation",
    tagline: "Modding tool for Your Only Move Is Hustle",
    favicon: "img/favicon.ico",

    // Set the production url of your site here
    url: "https://bustle.ldlework.com",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "dustinlacewell", // Usually your GitHub org/user name.
    projectName: "bustle", // Usually your repo name.

    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"]
    },

    presets: [
        [
            "classic",
      {
          docs: {
              sidebarPath: "./sidebars.ts",
              // Please change this to your repo.
              // Remove this to remove the "edit this page" links.
              editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/"
          },
          blog: {
              showReadingTime: true,
              feedOptions: {
                  type: ["rss", "atom"],
                  xslt: true
              },
              // Please change this to your repo.
              // Remove this to remove the "edit this page" links.
              editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
              // Useful options to enforce blogging best practices
              onInlineTags: "warn",
              onInlineAuthors: "warn",
              onUntruncatedBlogPosts: "warn"
          },
          theme: {
              customCss: "./src/css/custom.css"
          }
      } satisfies Preset.Options
        ]
    ],

    themeConfig: {
    // Replace with your project's social card
        image: "img/logo.png",
        colorMode: {
            defaultMode: "dark",
            respectPrefersColorScheme: true
        },
        navbar: {
            title: "Bustle",
            logo: {
                alt: "Bustle Logo",
                src: "img/favicon.ico"
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "tutorialSidebar",
                    position: "left",
                    label: "Docs"
                },
                {
                    to: "/screenshots",
                    label: "Screenshots",
                    position: "left"
                },
                {
                    to: "/lists",
                    label: "Mods",
                    position: "left"
                },
                // { to: "/blog", label: "Blog", position: "left" },
                {
                    href: "https://github.com/dustinlacewell/bustle",
                    label: "GitHub",
                    position: "right"
                }
            ]
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Getting Started",
                            to: "/docs/intro"
                        },
                        {
                            label: "Commands",
                            to: "/docs/commands"
                        }
                    ]
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "YOMI Hustle Discord",
                            href: "https://discordapp.com/invite/docusaurus"
                        },
                        {
                            label: "Modding Discord",
                            href: "https://discordapp.com/invite/docusaurus"
                        },
                    ]
                },
                {
                    title: "More",
                    items: [
                        // {
                        //     label: "Blog",
                        //     to: "/blog"
                        // },
                        {
                            label: "GitHub",
                            href: "https://github.com/facebook/docusaurus"
                        },
                        {
                            label: "Latest Release",
                            href: "https://github.com/facebook/docusaurus"
                        },
                        {
                            label: "Dev Build",
                            href: "https://github.com/facebook/docusaurus"
                        }
                    ]
                }
            ],
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ["bash"]
        }
    } satisfies Preset.ThemeConfig
}

export default config
