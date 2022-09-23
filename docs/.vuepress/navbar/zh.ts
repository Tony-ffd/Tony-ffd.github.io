import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  { text: "后端", link: "/back/" },
  {
    text: "前端",
    prefix: "/font/",
    children: [
      {
        text: "vue",
        prefix: "vue/",
        children: [
          { text: "vue2", icon: "edit", link: "1" },
          { text: "vue3", icon: "edit", link: "2" },
        ],
      },
    ],
  },
  {
    text: "大数据",
    link: "/bigdata/",
  },
  { text: "运维", link: "/operations/" },
  { text: "算法", link: "/algorithm/" },
  { text: "其它", link: "/other/" },
]);
