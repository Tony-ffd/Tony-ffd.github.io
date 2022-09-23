import {defineUserConfig} from "vuepress";
import {searchPlugin} from '@vuepress/plugin-search'
import theme from "./theme.js";

export default defineUserConfig({
    //基本路径
    base: "/",
    //vuepress build的输出目录
    dest: "./dist",
    //语言
    lang: "zh-CN",
    //标题
    title: "Tony-ffd",
    //描述
    description: "Tony-ffd 的博客演示",
    //主题ts
    theme,
    //所有其它页面所需的文件都会被预拉取
    shouldPrefetch: false,
    plugins: [
        searchPlugin({
            locales: {
                '/': {
                    placeholder: '搜索',
                },
            },

        })
    ]
});
