const axios = require('axios');

class AIImageService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseURL = 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5';
  }

  async generateImage(prompt) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          inputs: prompt,
          parameters: {
            width: 512,
            height: 512,
            num_inference_steps: 20,
            guidance_scale: 7.5,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      return {
        success: true,
        imageBuffer: Buffer.from(response.data),
        format: 'png',
      };
    } catch (error) {
      console.error('AI Image generation error:', error.message);
      return {
        success: false,
        error: 'Failed to generate image. Please try again.',
      };
    }
  }

  async generateImageWithFallback(prompt) {
    // Try with the main model first
    let result = await this.generateImage(prompt);
    
    if (!result.success) {
      // Fallback to a simpler model if the main one fails
      const fallbackURL = 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4';
      
      try {
        const response = await axios.post(
          fallbackURL,
          {
            inputs: prompt,
            parameters: {
              width: 512,
              height: 512,
              num_inference_steps: 15,
              guidance_scale: 7.0,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
          }
        );

        result = {
          success: true,
          imageBuffer: Buffer.from(response.data),
          format: 'png',
        };
      } catch (fallbackError) {
        console.error('Fallback AI Image generation error:', fallbackError.message);
        result = {
          success: false,
          error: 'Image generation service is temporarily unavailable.',
        };
      }
    }

    return result;
  }
}

module.exports = new AIImageService();
