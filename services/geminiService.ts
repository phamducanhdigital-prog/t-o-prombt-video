
import { GoogleGenAI, Type } from "@google/genai";
import { ProductInput, AnalysisResult } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async analyzeProduct(input: ProductInput): Promise<AnalysisResult> {
    const ai = this.getAI();
    const prompt = `
      Bạn là một chuyên gia chiến lược marketing và giám đốc sáng tạo đẳng cấp thế giới. Hãy thực hiện phân tích sâu về sản phẩm sau đây bằng TIẾNG VIỆT.
      
      CHI TIẾT SẢN PHẨM:
      - Tên: ${input.name}
      - Mô tả: ${input.description}
      - Đối tượng mục tiêu: ${input.targetAudience}
      - Lợi ích chính: ${input.keyBenefits.join(', ')}

      NHIỆM VỤ (Tất cả kết quả phải bằng tiếng Việt):
      1. Xác định "Job-To-Be-Done" (JTBD) theo khung: Công việc Chức năng (Functional), Cảm xúc (Emotional), và Xã hội (Social).
      2. Trích xuất một Insight tâm lý sâu sắc về lý do tại sao khách hàng thực sự khao khát sản phẩm này.
      3. Tạo một "Hook" hình ảnh/nội dung trong 3 giây đầu tiên cực kỳ thu hút, nhắm thẳng vào nỗi đau hoặc mong muốn của khách hàng.
      4. Viết một Caption quảng cáo mạng xã hội (Facebook/TikTok/Instagram) đầy lôi cuốn.
      5. Tạo một Prompt chi tiết cho AI Video Generator (phong cách Veo/Sora) phản ánh đúng linh hồn của sản phẩm và insight đã tìm ra.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jtbd: {
              type: Type.OBJECT,
              properties: {
                functionalJob: { type: Type.STRING },
                emotionalJob: { type: Type.STRING },
                socialJob: { type: Type.STRING },
                mainInsight: { type: Type.STRING }
              },
              required: ["functionalJob", "emotionalJob", "socialJob", "mainInsight"]
            },
            strategy: {
              type: Type.OBJECT,
              properties: {
                threeSecondHook: { type: Type.STRING },
                caption: { type: Type.STRING },
                videoPrompt: { type: Type.STRING },
                visualKeywords: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ["threeSecondHook", "caption", "videoPrompt", "visualKeywords"]
            }
          },
          required: ["jtbd", "strategy"]
        }
      }
    });

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Không thể xử lý phản hồi từ AI. Vui lòng thử lại.");
    }
  }

  static async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '9:16') {
    const ai = this.getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
