declare module "express-mysql-session" {
  import type session from "express-session";

  interface MySQLStoreOptions {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    createDatabaseTable?: boolean;
    schema?: {
      tableName?: string;
      columnNames?: {
        session_id?: string;
        expires?: string;
        data?: string;
      };
    };
  }

  class MySQLStore extends session.Store {
    constructor(options: MySQLStoreOptions);
  }

  const factory: (sessionModule: typeof session) => typeof MySQLStore;
  export default factory;
}
