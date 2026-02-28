/**
 * ExternalBlob utility for blob-storage component.
 * Provides URL access to stored blobs via the direct URL pattern.
 */
export class ExternalBlob {
  private blobId: string;
  private progressCallback?: (percentage: number) => void;

  private constructor(blobId: string) {
    this.blobId = blobId;
  }

  static fromURL(url: string): ExternalBlob {
    return new ExternalBlob(url);
  }

  static fromBytes(_bytes: Uint8Array): ExternalBlob {
    throw new Error("Use StorageClient for uploads");
  }

  withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.progressCallback = onProgress;
    return this;
  }

  getDirectURL(): string {
    return this.blobId;
  }

  async getBytes(): Promise<Uint8Array> {
    const response = await fetch(this.blobId);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
}
