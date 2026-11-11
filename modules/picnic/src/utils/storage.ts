export interface KeyValueStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}

let store: KeyValueStore | null = null

export function setKeyValueStore(next: KeyValueStore | null): void {
  store = next
}

export function getKeyValueStore(): KeyValueStore | null {
  return store
}
