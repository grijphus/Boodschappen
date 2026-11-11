import crypto from "crypto"
import fs from "fs/promises"
import { config } from "../config.js"
import { getKeyValueStore } from "./storage.js"

/**
 * Resolve the device id used for the x-picnic-did header.
 *
 * Precedence:
 *   1. PICNIC_DEVICE_ID, when explicitly set.
 *   2. A previously persisted id read from PICNIC_DEVICE_FILE.
 *   3. A freshly generated id, persisted to PICNIC_DEVICE_FILE for reuse.
 *
 * This gives every installation a stable, per-install device fingerprint
 * without requiring any configuration, instead of falling back to picnic-api's
 * shared default device id.
 */
export async function resolveDeviceId(): Promise<string> {
  if (config.PICNIC_DEVICE_ID) {
    return config.PICNIC_DEVICE_ID
  }

  const kv = getKeyValueStore()
  try {
    const data = kv
      ? await kv.get("picnic-device")
      : await fs.readFile(config.PICNIC_DEVICE_FILE, "utf-8")
    if (data) {
      const { deviceId } = JSON.parse(data)
      if (deviceId) return deviceId
    }
  } catch {
    // No persisted id yet; fall through to generation.
  }

  const deviceId = crypto.randomBytes(8).toString("hex").toUpperCase()
  try {
    if (kv) {
      await kv.set("picnic-device", JSON.stringify({ deviceId }))
    } else {
      await fs.writeFile(config.PICNIC_DEVICE_FILE, JSON.stringify({ deviceId }))
    }
  } catch {
    // If persistence fails, still use the generated id for this run.
  }
  return deviceId
}
