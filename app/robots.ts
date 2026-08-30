import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/razoragent/mcp', '/api/razoragent/*', '/connect', '/razoragent'],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Amazonbot', 'anthropic-ai', 'OpenAI'],
        allow: ['/'],
      },
    ],
  };
}
