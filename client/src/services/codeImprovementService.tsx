// src/services/codeImprovementService.ts
import { mcpService } from './mcpService';

export const codeImprovementService = {
  /**
   * Request improved code transformation from the MCP server
   */
  async improveCode(originalCode: string, currentCode: string, options: Record<string, unknown>) {
    try {
      const response = await mcpService.callEndpoint('/improve-code', {
        method: 'POST',
        body: JSON.stringify({
          originalCode,
          currentCode,
          options
        })
      });
      
      return response;
    } catch (error) {
      console.error('Error improving code:', error);
      throw new Error('Failed to improve code. Please try again.');
    }
  },
  
  /**
   * Generate improvement suggestions for specific code issues
   */
  async getSuggestions(code: string, issue: string): Promise<unknown> {
    try {
      const response = await mcpService.callEndpoint('/code-suggestions', {
        method: 'POST',
        body: JSON.stringify({
          code,
          issue
        })
      });
      
      return response;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw new Error('Failed to get improvement suggestions.');
    }
  }
};