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

// Uses TIKWM free API — no API key required
async function extractTikTok(url: string): Promise<string> {
  try {
    const response = await axios.get('https://www.tikwm.com/api/', {
      params: { url, hd: 0 },
      timeout: 10000,
    })
    const data = response.data?.data
    if (!data) throw new Error()
    const text = [data.title, data.desc].filter(Boolean).join(' ')
    if (!text) throw new Error()
    return text
  } catch {
    throw new Error('Não foi possível extrair o conteúdo do TikTok. Verifica se o link é válido e público.')
  }
}

async function extractInstagram(url: string): Promise<string> {
  const host = process.env.RAPIDAPI_INSTAGRAM_HOST || 'instagram-scraper-api2.p.rapidapi.com'
  try {
    const response = await axios.get(`https://${host}/v1/post_info`, {
      params: { code_or_id_or_url: url },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': host,
      },
      timeout: 10000,
    })
    const caption = response.data?.data?.caption
    if (!caption) throw new Error()
    return caption
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('API key do Instagram inválida ou em falta. Configura RAPIDAPI_KEY.')
    }
    throw new Error('Não foi possível extrair o conteúdo do Instagram. Verifica se o post é público.')
  }
}
