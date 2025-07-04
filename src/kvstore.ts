// db/kvstore.ts
import { promises as fs } from "fs";
import * as path from "path";

type KVData = Record<string, string>;

export class KVStore {
  private data: KVData = {};
  private filePath = path.resolve(__dirname, "../data.json");

  constructor() {}

  async init() {
    try {
      const file = await fs.readFile(this.filePath, "utf8");
      this.data = JSON.parse(file);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        await this.save();
      } else {
        console.error("Failed to load KV store:", err);
      }
    }
  }

  private async save() {
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
  }

  async set(key: string, value: string) {
    this.data[key] = value;
    await this.save();
  }

  get(key: string): string | undefined {
    return this.data[key];
  }

  async delete(key: string) {
    delete this.data[key];
    await this.save();
  }

  list(): string[] {
    return Object.keys(this.data);
  }
}
