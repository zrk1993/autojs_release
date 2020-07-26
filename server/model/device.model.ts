import BaseModel from './base.model';

export const tableName = 'device';
export interface ITableStructure {
  device_id?: number,
  name?: string,
  category?: string,
  ip?: string,
  create_time?: string,
  connect_time?: string,
  [propname: string]: any
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  async getByDeviceName(name: string) {
    return this.$db.table(tableName).where({ name }).findOrEmpty();
  }

  async getByIp(ip: string) {
    return this.$db.table(tableName).where({ ip }).findOrEmpty();
  }

  async getByCategory(category: string): Promise<ITableStructure[]> {
    return this.$db.table(tableName).where({ category }).select();
  }

}

export default new DeviceModel();

