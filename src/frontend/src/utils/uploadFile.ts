import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
/**
 * Upload a file to blob storage using the StorageClient.
 * Returns the direct URL (blobId) for the uploaded file.
 */
import { StorageClient } from "./StorageClient";

export async function uploadFile(
  file: File,
  bucket: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  // loadConfig returns the app config - we access known properties safely
  const config = (await loadConfig()) as unknown as Record<string, string>;

  const host =
    config.backend_host && config.backend_host !== "undefined"
      ? config.backend_host
      : "https://icp-api.io";

  const storageGatewayUrl =
    config.storage_gateway_url && config.storage_gateway_url !== "undefined"
      ? config.storage_gateway_url
      : "https://storage.caffeine.ai";

  const backendCanisterId = config.backend_canister_id ?? "";
  const projectId = config.project_id ?? "";

  const agent = new HttpAgent({ host });

  const storageClient = new StorageClient(
    bucket,
    storageGatewayUrl,
    backendCanisterId,
    projectId,
    agent,
  );

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await storageClient.putFile(bytes, onProgress);
  return storageClient.getDirectURL(result.hash);
}
