const sharp = require('sharp');

class ImageService {
  async convertFormat(imageBuffer, targetFormat = 'png') {
    try {
      let processedImage;
      
      switch (targetFormat.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
          processedImage = await sharp(imageBuffer)
            .jpeg({ quality: 90 })
            .toBuffer();
          break;
        case 'png':
          processedImage = await sharp(imageBuffer)
            .png()
            .toBuffer();
          break;
        case 'webp':
          processedImage = await sharp(imageBuffer)
            .webp({ quality: 90 })
            .toBuffer();
          break;
        default:
          throw new Error('Unsupported format');
      }
      
      return {
        success: true,
        buffer: processedImage,
        format: targetFormat.toLowerCase(),
      };
    } catch (error) {
      console.error('Image conversion error:', error);
      return {
        success: false,
        error: 'Failed to convert image format.',
      };
    }
  }

  async compressImage(imageBuffer, quality = 80, maxWidth = 1024) {
    try {
      const processedImage = await sharp(imageBuffer)
        .resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality })
        .toBuffer();
      
      return {
        success: true,
        buffer: processedImage,
        originalSize: imageBuffer.length,
        compressedSize: processedImage.length,
        compressionRatio: ((imageBuffer.length - processedImage.length) / imageBuffer.length * 100).toFixed(2),
      };
    } catch (error) {
      console.error('Image compression error:', error);
      return {
        success: false,
        error: 'Failed to compress image.',
      };
    }
  }

  async resizeImage(imageBuffer, width, height) {
    try {
      const processedImage = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'fill',
        })
        .toBuffer();
      
      return {
        success: true,
        buffer: processedImage,
        width,
        height,
      };
    } catch (error) {
      console.error('Image resize error:', error);
      return {
        success: false,
        error: 'Failed to resize image.',
      };
    }
  }

  async getImageInfo(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      return {
        success: true,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length,
        hasAlpha: metadata.hasAlpha,
        hasProfile: metadata.hasProfile,
      };
    } catch (error) {
      console.error('Image info error:', error);
      return {
        success: false,
        error: 'Failed to get image information.',
      };
    }
  }
}

module.exports = new ImageService();
