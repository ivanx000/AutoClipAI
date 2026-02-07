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

// Cache key for localStorage
const HERO_VIDEOS_CACHE_KEY = 'autoclip_hero_videos';
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

interface CachedVideos {
  videos: string[];
  timestamp: number;
}

// Get cached videos if they exist and aren't expired
function getCachedHeroVideos(): string[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(HERO_VIDEOS_CACHE_KEY);
    if (!cached) return null;
    
    const { videos, timestamp }: CachedVideos = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION_MS;
    
    if (isExpired) {
      localStorage.removeItem(HERO_VIDEOS_CACHE_KEY);
      return null;
    }
    
    return videos;
  } catch {
    return null;
  }
}

// Save videos to cache
function cacheHeroVideos(videos: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData: CachedVideos = {
      videos,
      timestamp: Date.now(),
    };
    localStorage.setItem(HERO_VIDEOS_CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore storage errors
  }
}

// Get a random page number for variety
function getRandomPage(): number {
  return Math.floor(Math.random() * 5) + 1; // Pages 1-5
}

// Get random categories from available options
function getRandomCategories(count: number = 3): VideoCategory[] {
  const allCategories = Object.keys(VIDEO_CATEGORIES) as VideoCategory[];
  const shuffled = [...allCategories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

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
  countPerCategory: number = 1,
  options?: { useCache?: boolean }
): Promise<string[]> {
  const useCache = options?.useCache ?? true;
  
  // Check cache first to avoid unnecessary API calls
  if (useCache) {
    const cached = getCachedHeroVideos();
    if (cached && cached.length > 0) {
      return cached;
    }
  }
  
  // Use random categories and pages for variety
  const randomCategories = getRandomCategories(categories.length);
  const randomPage = getRandomPage();
  
  const promises = randomCategories.map((cat) => 
    fetchVerticalVideos(VIDEO_CATEGORIES[cat], countPerCategory, { page: randomPage })
  );
  
  const results = await Promise.all(promises);
  const videos = results.flat();
  
  // Cache the results
  if (useCache && videos.length > 0) {
    cacheHeroVideos(videos);
  }
  
  return videos;
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
