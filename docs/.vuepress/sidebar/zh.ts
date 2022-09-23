import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/back/": [
    {
      text: "Java",
      prefix: "java/",
      link: "java/",
      children: "structure",
    },
    {
      text: "Spring",
      prefix: "spring/",
      link: "spring/",
      children: "structure",
    },
  ],
  "/font/": [
    {
      text: "Js",
      prefix: "js/",
      link: "js/",
      children: "structure",
    },
    {
      text: "Vue",
      prefix: "vue/",
      link: "vue/",
      children: "structure",
    },
  ],
});
