// src/server.ts
import { createServer, Socket } from "net";
import { KVStore } from "./kvstore";

interface KVServerOptions {
  port?: number;
}

export class KVServer {
  private port: number;
  private store: KVStore;

  constructor(options: KVServerOptions = {}) {
    this.port = options.port || 4000;
    this.store = new KVStore();
  }

  async start() {
    await this.store.init();

    const server = createServer((socket: Socket) => {
      socket.setEncoding("utf8");
      socket.write("KVDB Ready. Commands: GET, SET, DELETE, LIST\n");

      socket.on("data", async (data) => {
        const input = data.toString().trim();
        const [command, ...args] = input.split(" ");

        switch (command.toUpperCase()) {
          case "GET":
            if (args.length !== 1) return socket.write("Usage: GET <key>\n");
            const val = this.store.get(args[0]);
            socket.write(val !== undefined ? `${val}\n` : "NOT FOUND\n");
            break;

          case "SET":
            if (args.length < 2) return socket.write("Usage: SET <key> <value>\n");
            const key = args[0];
            const value = args.slice(1).join(" ");
            await this.store.set(key, value);
            socket.write("OK\n");
            break;

          case "DELETE":
            if (args.length !== 1) return socket.write("Usage: DELETE <key>\n");
            await this.store.delete(args[0]);
            socket.write("DELETED\n");
            break;

          case "LIST":
            socket.write(this.store.list().join(", ") + "\n");
            break;

          case "QUIT":
          case "EXIT":
            socket.write("Bye!\n");
            socket.end();
            break;

          default:
            socket.write("Unknown command\n");
        }
      });
    });

    server.listen(this.port, () => {
      console.log(`KVServer listening on port ${this.port}`);
    });
  }
}
