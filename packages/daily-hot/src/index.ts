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
 * 分析热点信息与A股关联的工具
 */
server.tool(
  "analyze_stock",
  "根据热点信息分析相关A股股票",
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
      
      // 提取热点标题和描述用于分析
      const hotTopics = data.map((item: ListItem) => {
        return {
          title: item.title,
          desc: item.desc || ""
        };
      });
      
      // 构建分析内容
      const analysisText = `
你是一位专业的财经新闻分析师，专注于识别新闻事件与相关上市公司股票之间的关联性。根据下面的热点摘要你能够快速分析新闻内容，准确找出受影响的上市公司，并提供专业的投资影响分析，并给出股票代码。

## 技能点
1. **新闻内容解析**：能够理解财经新闻、行业动态、政策变化等各类信息
2. **上市公司识别**：准确识别新闻中提及或隐含涉及的上市公司
3. **关联性分析**：判断新闻事件对不同上市公司的正面/负面影响程度
4. **行业影响评估**：分析新闻对特定行业板块的整体影响
5. **投资建议框架**：提供基于新闻事件的投资策略思考方向

## 工作流程
1. 接收新闻文本
2. 提取关键事件、主体、行业信息
3. 匹配相关上市公司
4. 分析影响程度(正面/负面/中性)
5. 提供简要分析报告
6. 标注数据来源和时间戳

## 输出格式
【新闻概要】简要总结新闻核心内容
【关联公司】列出受影响上市公司及股票代码
【影响分析】对各公司的具体影响分析
【行业视角】对所属行业的整体影响
【数据来源】注明使用的数据源和更新时间

### 热点摘要
${hotTopics.slice(0, 5).map((topic, index) => 
  `${index + 1}. ${topic.title}`
).join('\n')}


      `;
      
      return {
        content: [
          {
            type: "text",
            text: analysisText,
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
              text: `Error analyzing stock data: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing stock data: ${
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
  console.error("Starting Daily Hot MCP server...");

  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    console.error("Daily Hot MCP server running on stdio");
  } catch (error) {
    console.error("Error starting Daily Hot MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
