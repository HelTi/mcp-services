#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

/**
 * 创建MCP服务器实例
 */
const server = new McpServer({
  name: "daily-hot",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// 榜单类型枚举
enum NewsTypeEnum {
  ZHIHU = 'zhihu',
  WEIBO = 'weibo',
  BAIDU = 'baidu',
  DOUBAN = 'douban',
  TOUTIAO = 'toutiao',
  BILIBILI = 'bilibili',
  DOUYIN = 'douyin',
  KUAISHOU = 'kuaishou',
  HUPU = 'hupu',
  WEREAD = 'weread',
  GEEKPARK = 'geekpark',
  GUOKR = 'guokr',
  NETEASE_NEWS = 'netease-news',
  SINA_NEWS = 'sina-news',
  KR36 = '36kr',
  ITHOME = 'ithome',
  THEPAPER = 'thepaper',
  QQ_NEWS = 'qq-news',
  CLS = 'cls',
  JIN10 = 'jin10',
  WALLSTREET = 'wallstreet',
  YICAI = 'yicai',
  CAIXIN = 'caixin',
  JUEJIN = 'juejin',
  CSDN = 'csdn',
  HELLOGITHUB = 'hellogithub',
  GITHUB = 'github',
  DOUBAN_GROUP = 'douban-group',
  TIEBA = 'tieba',
  DOUBAN_MOVIE = 'douban-movie',
  STARRAIL = 'starrail',
  GENSHIN = 'genshin',
  LOL = 'lol',
}

// 榜单类型中文名称映射
const newsTypeNameMap: Record<NewsTypeEnum, string> = {
  [NewsTypeEnum.ZHIHU]: '知乎',
  [NewsTypeEnum.WEIBO]: '微博',
  [NewsTypeEnum.BAIDU]: '百度',
  [NewsTypeEnum.DOUBAN]: '豆瓣',
  [NewsTypeEnum.TOUTIAO]: '头条',
  [NewsTypeEnum.BILIBILI]: '哔哩哔哩',
  [NewsTypeEnum.DOUYIN]: '抖音',
  [NewsTypeEnum.KUAISHOU]: '快手',
  [NewsTypeEnum.HUPU]: '虎扑',
  [NewsTypeEnum.WEREAD]: '微信读书',
  [NewsTypeEnum.GEEKPARK]: '极客公园',
  [NewsTypeEnum.GUOKR]: '果壳',
  [NewsTypeEnum.NETEASE_NEWS]: '网易新闻',
  [NewsTypeEnum.SINA_NEWS]: '新浪新闻',
  [NewsTypeEnum.KR36]: '36氪',
  [NewsTypeEnum.ITHOME]: 'IT之家',
  [NewsTypeEnum.THEPAPER]: '澎湃新闻',
  [NewsTypeEnum.QQ_NEWS]: 'QQ新闻',
  [NewsTypeEnum.CLS]: '财联社',
  [NewsTypeEnum.JIN10]: '金十数据',
  [NewsTypeEnum.WALLSTREET]: '华尔街见闻',
  [NewsTypeEnum.YICAI]: '第一财经',
  [NewsTypeEnum.CAIXIN]: '财新网',
  [NewsTypeEnum.JUEJIN]: '掘金',
  [NewsTypeEnum.CSDN]: 'CSDN',
  [NewsTypeEnum.HELLOGITHUB]: 'HelloGitHub',
  [NewsTypeEnum.GITHUB]: 'GitHub 趋势',
  [NewsTypeEnum.DOUBAN_GROUP]: '豆瓣小组',
  [NewsTypeEnum.TIEBA]: '百度贴吧',
  [NewsTypeEnum.DOUBAN_MOVIE]: '豆瓣电影',
  [NewsTypeEnum.STARRAIL]: '崩坏：星穹铁道',
  [NewsTypeEnum.GENSHIN]: '原神',
  [NewsTypeEnum.LOL]: '英雄联盟',
};

// 榜单类型值数组（用于zod验证）
const newsTypeValues = Object.values(NewsTypeEnum) as [string, ...string[]];

// 榜单数据
export interface ListItem {
  id: number | string;
  title: string;
  cover?: string;
  author?: string;
  desc?: string;
  hot: number | string | undefined;
  timestamp: number | undefined;
  url: string;
  mobileUrl: string;
}

// 路由接口数据
export interface RouterResType {
  updateTime: string | number;
  fromCache: boolean;
  data: ListItem[];
  message?: string;
}

// 响应数据类型
export interface ResponseType extends RouterResType {
  name: string;
  title: string;
  type: string;
  description?: string;
  params?: Record<string, string | object>;
  total: number;
  link?: string;
}


/**
 * 获取榜单信息的工具
 */
server.tool(
  "get_daily_hot",
  "获取榜单信息",
  {
    type: z.enum(newsTypeValues).describe(`榜单类型: ${Object.entries(NewsTypeEnum).filter(([key]) => isNaN(Number(key))).map(([_, value]) => `${value}(${newsTypeNameMap[value as NewsTypeEnum]})`).join(', ')}`),
  },
  async ({ type }) => {
    try {
      // 发送请求获取榜单数据
      const response = await axios.get<ResponseType>(
        `http://localhost:6688/${type}?cache=true`
      );
      // 解析响应数据 
      const { data } = response.data;
      const hotList = data.map((item: ListItem) => {
        return `标题📖：${item.title} \n热度🔥：${item.hot} \n链接🔗：${item.url} \n描述📖： ${item.desc}\n\n`
      }).join("\n");
      return {
        content: [
          {
            type: "text",
            text: `榜单类型: ${newsTypeNameMap[type as NewsTypeEnum] || type}`,
          },
          {
            type: "text",
            text: `榜单数据:\n\n${hotList}`,
          },
        ],
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.status || error.message;
        return {
          content: [
            {
              type: "text",
              text: `Error fetching daily news data: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * 使用stdio传输启动服务器
 */
async function main() {
  console.error("Starting Weather MCP server...");

  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    console.error("Weather MCP server running on stdio");
  } catch (error) {
    console.error("Error starting Weather MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
