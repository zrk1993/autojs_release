import db from '@/utils/db';

export default class BaseService<T> {
  $db = db;
  $tableName: string;
  $primaryKey: string;
  $tableStructure: T;

  constructor(args: { tableName: string, primaryKey?: string }) {
    this.$tableName = args.tableName;
    this.$primaryKey = args.primaryKey || `${args.tableName}_id`;
  }

  async getById(id: string | number): Promise<T> {
    return await db.table(this.$tableName).where({ [this.$primaryKey]: id }).findOrEmpty();
  }

  async getAll(): Promise<T[]> {
    return await db.table(this.$tableName).select();
  }

  async getPage(): Promise<T[]> {
    return await db.table(this.$tableName).select();
  }

  async deleteById(id: string | number) {
    return await db.table(this.$tableName).where({ [this.$primaryKey]: id }).delete();
  }

  async insert(data: T): Promise<any>;
  async insert(data: T[]): Promise<void>;
  async insert(data: T | T[]): Promise<any> {
    return await db.table(this.$tableName).insert(data);
  }

  async updateById(id: string | number, data: T) {
    return await db.table(this.$tableName).where({ [this.$primaryKey]: id }).update(data);
  }

  async page(page: number, size: number):Promise<{ data: T[], total: number }> {
    const args = [];
    let sql = `SELECT * FROM t_${this.$tableName} WHERE 1=1`;
    const [{ total }] = await db.query(sql.replace(/SELECT[\s\S]*?FROM/, "SELECT COUNT(*) AS total FROM"), args);
    sql += ' ORDER BY id DESC LIMIT ?, ?';
    args.push(page * size - size, +size);
    const data = await db.query(sql, args);
    return {
      data,
      total
    }
  }
}