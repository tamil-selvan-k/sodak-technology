export interface PaginationParams {
  page?: number
  perPage?: number
}

export interface PaginationMeta {
  total: number
  page: number
  perPage: number
  pages: number
}

export function parsePagination(params: PaginationParams): { skip: number; take: number; page: number; perPage: number } {
  const page    = Math.max(1, params.page    ?? 1)
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 20))
  return { skip: (page - 1) * perPage, take: perPage, page, perPage }
}

export function buildMeta(total: number, page: number, perPage: number): PaginationMeta {
  return { total, page, perPage, pages: Math.ceil(total / perPage) }
}
