import { YoutubeTranscript } from 'youtube-transcript'
import axios from 'axios'

export type VideoSource = 'youtube' | 'tiktok' | 'instagram'

export function detectSource(url: string): VideoSource {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  throw new Error('URL não suportada. Use YouTube, TikTok ou Instagram.')
}

export async function extractVideoText(url: string, source: VideoSource): Promise<string> {
  switch (source) {
    case 'youtube':
      return extractYouTube(url)
    case 'tiktok':
      return extractTikTok(url)
    case 'instagram':
      return extractInstagram(url)
  }
}

async function extractYouTube(url: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url)
    return transcript.map(t => t.text).join(' ')
  } catch {
    throw new Error('Não foi possível extrair a transcrição do YouTube. O vídeo tem legendas ativas?')
  }
}

async function extractTikTok(url: string): Promise<string> {
  const response = await axios.get('https://tiktok-scraper7.p.rapidapi.com/video/info', {
    params: { url },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': process.env.RAPIDAPI_TIKTOK_HOST || 'tiktok-scraper7.p.rapidapi.com',
    },
  })
  const desc = response.data?.data?.video?.desc
  if (!desc) throw new Error('Não foi possível extrair o conteúdo do TikTok.')
  return desc
}

async function extractInstagram(url: string): Promise<string> {
  const response = await axios.get('https://instagram-scraper-api2.p.rapidapi.com/v1/post_info', {
    params: { code_or_id_or_url: url },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': process.env.RAPIDAPI_INSTAGRAM_HOST || 'instagram-scraper-api2.p.rapidapi.com',
    },
  })
  const caption = response.data?.data?.caption
  if (!caption) throw new Error('Não foi possível extrair o conteúdo do Instagram.')
  return caption
}
