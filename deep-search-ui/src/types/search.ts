export interface SearchResult {
  id: number
  content: string
  score: number
  metadata: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  total?: number
}
