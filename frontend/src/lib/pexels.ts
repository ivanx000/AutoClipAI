const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY || '';

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
  image: string;
}

interface PexelsResponse {
  videos: PexelsVideo[];
}

// Predefined video categories that work well for content creation tools
export const VIDEO_CATEGORIES = {
  // Trendy content creator vibes
  contentCreator: 'influencer filming content creator smartphone',
  socialMedia: 'social media phone scrolling tiktok',
  lifestyle: 'lifestyle aesthetic morning routine',
  
  // Tech & creative
  technology: 'technology phone hands typing',
  creative: 'creative artist editing video',
  gaming: 'gaming esports streamer',
  
  // Engaging visuals
  urban: 'city lights urban night aesthetic',
  nature: 'nature cinematic forest mountains',
  travel: 'travel adventure explore vlog',
  fashion: 'fashion style outfit aesthetic',
  fitness: 'fitness workout gym motivation',
  food: 'food cooking aesthetic chef',
  
  // Abstract & artistic
  abstract: 'abstract colors motion graphics',
  neon: 'neon lights colorful glow',
  minimal: 'minimal aesthetic clean white',
} as const;

export type VideoCategory = keyof typeof VIDEO_CATEGORIES;

export async function fetchVerticalVideos(
  query: string = VIDEO_CATEGORIES.contentCreator, 
  count: number = 3,
  options?: { minDuration?: number; page?: number }
): Promise<string[]> {
  if (!PEXELS_API_KEY) {
    console.warn('Pexels API key not found, using fallback');
    return [];
  }

  try {
    const page = options?.page || 1;
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=${count * 3}&page=${page}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    const data: PexelsResponse = await response.json();
    
    // Get HD quality vertical videos, filter for better quality
    const videoUrls = data.videos
      .filter((video) => {
        // Filter for proper vertical aspect ratio
        return video.height > video.width;
      })
      .slice(0, count)
      .map((video) => {
        // Prefer HD quality, then SD
        const hdFile = video.video_files.find(
          (f) => f.quality === 'hd' && f.height > f.width && f.file_type === 'video/mp4'
        );
        const sdFile = video.video_files.find(
          (f) => f.quality === 'sd' && f.height > f.width && f.file_type === 'video/mp4'
        );
        return hdFile?.link || sdFile?.link || video.video_files[0]?.link;
      })
      .filter(Boolean);

    return videoUrls;
  } catch (error) {
    console.error('Error fetching Pexels videos:', error);
    return [];
  }
}

// Fetch videos from multiple categories for variety
export async function fetchMixedVideos(
  categories: VideoCategory[] = ['contentCreator', 'urban', 'creative'],
  countPerCategory: number = 1
): Promise<string[]> {
  const promises = categories.map((cat) => 
    fetchVerticalVideos(VIDEO_CATEGORIES[cat], countPerCategory)
  );
  
  const results = await Promise.all(promises);
  return results.flat();
}

export async function fetchVideoPosters(query: string = 'vertical video', count: number = 3): Promise<string[]> {
  if (!PEXELS_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=${count}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    const data: PexelsResponse = await response.json();
    return data.videos.map((video) => video.image);
  } catch (error) {
    console.error('Error fetching Pexels posters:', error);
    return [];
  }
}
