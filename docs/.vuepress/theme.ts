import {hopeTheme} from "vuepress-theme-hope";
import {zhNavbar} from "./navbar/index.js";
import {zhSidebar} from "./sidebar/index.js";

export default hopeTheme({
    //部署地址
    // hostname: "https://mister-hope.github.io",

    //作者信息
    author: {
        name: "Tony-ffd",
        url: "https://gitee.com/tonyffd",
    },
    //字体图标资源链接
    iconAssets: "iconfont",
    //铺满屏幕
    fullscreen: true,
    //开启纯净模式
    pure: false,
    //导航栏图标
    logo: "/common/favicon-32x32-next.png",
    //文档在仓库中的目录
    docsDir: "docs",
    //文章信息，可以填入数组，数组的顺序是各条目显示的顺序
    pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],
    //
    blog: {
        //博主的媒体链接配置
        medias: {
            "QQ": "",
        },
    },

    // 顶部导航
    navbar: zhNavbar,

    // 侧边导航
    sidebar: zhSidebar,

    //页脚
    footer: "hello world",

    //是否显示页脚
    displayFooter: true,

    // page meta
    metaLocales: {
        editLink: "在 GitHub 上编辑此页",
    },

    //加密配置
    encrypt: {
        //最高权限密码
        admin: "fengfeida",
        config: {
            "/demo/encrypt.html": ["123456"],
            "/zh/demo/encrypt.html": ["123456"],
        },
    },

    plugins: {
        blog: {
            //是否为每个页面生成摘录。
            autoExcerpt: true,
        },

        //当前页面是否开启评论功能
        /*comment: {
            /!**
             * Using Giscus
             *!/
            provider: "Giscus",
            repo: "vuepress-theme-hope/giscus-discussions",
            repoId: "R_kgDOG_Pt2A",
            category: "Announcements",
            categoryId: "DIC_kwDOG_Pt2M4COD69",

        },*/

        mdEnhance: {
            align: true,
            attrs: true,
            chart: false,
            codetabs: true,
            container: true,
            demo: true,
            echarts: true,
            flowchart: true,
            gfm: true,
            imageSize: true,
            include: false,
            katex: false,
            lazyLoad: true,
            mark: true,
            mermaid: false,
            playground: {
                presets: ["ts", "vue"],
            },
            presentation: {
                plugins: ["highlight", "math", "search", "notes", "zoom"],
            },
            stylize: [
                {
                    matcher: "Recommanded",
                    replacer: ({tag}) => {
                        if (tag === "em")
                            return {
                                tag: "Badge",
                                attrs: {type: "tip"},
                                content: "Recommanded",
                            };
                    },
                },
            ],
            sub: true,
            sup: true,
            tabs: true,
            vpre: true,
            vuePlayground: true,
        },

        pwa: {
            favicon: "/common/avatar.gif",
            cacheHTML: true,
            cachePic: true,
            appendBase: true,
            apple: {
                icon: "/common/favicon-32x32-next.png",
                statusBarColor: "black",
            },
            msTile: {
                image: "/common/favicon-32x32-next.png",
                color: "#ffffff",
            },
            manifest: {
                icons: [
                    {
                        src: "/common/favicon-32x32-next.png",
                        sizes: "512x512",
                        purpose: "maskable",
                        type: "image/png",
                    },
                    {
                        src: "/common/favicon-16x16-next.png",
                        sizes: "192x192",
                        purpose: "maskable",
                        type: "image/png",
                    },
                    {
                        src: "/common/favicon-32x32-next.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/common/favicon-16x16-next.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                ],
                shortcuts: [
                    {
                        name: "Demo",
                        short_name: "Demo",
                        url: "/demo/",
                        icons: [
                            {
                                src: "/common/favicon-16x16-next.png",
                                sizes: "192x192",
                                purpose: "maskable",
                                type: "image/png",
                            },
                            {
                                src: "/common/favicon-16x16-next.png",
                                sizes: "192x192",
                                purpose: "monochrome",
                                type: "image/png",
                            },
                        ],
                    },
                ],
            },
        },


    },
});
