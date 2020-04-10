declare namespace NodeJS {
  export interface Global {
    __MONGO_URI__: string;
    __MONGOD__: any;
  }
}