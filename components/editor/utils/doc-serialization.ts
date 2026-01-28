import { SerializedDocument } from "@lexical/file"

// Guard: Only run in browser environment
const isBrowser = typeof window !== 'undefined'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function* generateReader<T = any>(
  reader: ReadableStreamDefaultReader<T>
) {
  let done = false
  while (!done) {
    const res = await reader.read()
    const { value } = res
    if (value !== undefined) {
      yield value
    }
    done = res.done
  }
}

async function readBytestoString(
  reader: ReadableStreamDefaultReader
): Promise<string> {
  const output = []
  const chunkSize = 0x8000
  for await (const value of generateReader(reader)) {
    for (let i = 0; i < value.length; i += chunkSize) {
      output.push(String.fromCharCode(...value.subarray(i, i + chunkSize)))
    }
  }
  return output.join("")
}

export async function docToHash(doc: SerializedDocument): Promise<string> {
  // Only run in browser - return empty hash on server
  if (!isBrowser || typeof CompressionStream === 'undefined') {
    // Fallback: use base64 encoding without compression
    const jsonString = JSON.stringify(doc)
    return `#doc=${btoa(jsonString)
      .replace(/\//g, "_")
      .replace(/\+/g, "-")
      .replace(/=+$/, "")}`
  }
  
  try {
    const cs = new CompressionStream("gzip")
    const writer = cs.writable.getWriter()
    const [, output] = await Promise.all([
      writer
        .write(new TextEncoder().encode(JSON.stringify(doc)))
        .then(() => writer.close()),
      readBytestoString(cs.readable.getReader()),
    ])
    return `#doc=${btoa(output)
      .replace(/\//g, "_")
      .replace(/\+/g, "-")
      .replace(/=+$/, "")}`
  } catch (error) {
    // Fallback if compression fails
    const jsonString = JSON.stringify(doc)
    return `#doc=${btoa(jsonString)
      .replace(/\//g, "_")
      .replace(/\+/g, "-")
      .replace(/=+$/, "")}`
  }
}

export async function docFromHash(
  hash: string
): Promise<SerializedDocument | null> {
  const m = /^#doc=(.*)$/.exec(hash)
  if (!m) {
    return null
  }
  
  // Only run in browser - fallback to uncompressed on server
  if (!isBrowser || typeof DecompressionStream === 'undefined') {
    // Fallback: assume it's uncompressed base64
    try {
      const b64 = atob(m[1].replace(/_/g, "/").replace(/-/g, "+"))
      return JSON.parse(b64)
    } catch {
      return null
    }
  }
  
  try {
    const ds = new DecompressionStream("gzip")
    const writer = ds.writable.getWriter()
    const b64 = atob(m[1].replace(/_/g, "/").replace(/-/g, "+"))
    const array = new Uint8Array(b64.length)
    for (let i = 0; i < b64.length; i++) {
      array[i] = b64.charCodeAt(i)
    }
    const closed = writer.write(array).then(() => writer.close())
    const output = []
    for await (const chunk of generateReader(
      ds.readable.pipeThrough(new TextDecoderStream()).getReader()
    )) {
      output.push(chunk)
    }
    await closed
    return JSON.parse(output.join(""))
  } catch (error) {
    // Fallback: try uncompressed
    try {
      const b64 = atob(m[1].replace(/_/g, "/").replace(/-/g, "+"))
      return JSON.parse(b64)
    } catch {
      return null
    }
  }
}
