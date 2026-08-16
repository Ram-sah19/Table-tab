export function normalizeDoc<T extends { _id?: unknown; id?: string }>(doc: T): T & { id: string } {
  const json = JSON.parse(JSON.stringify(doc)) as T & { _id?: unknown };
  return {
    ...json,
    id: (json._id ? String(json._id) : json.id) as string,
  };
}
