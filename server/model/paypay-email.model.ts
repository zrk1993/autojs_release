import BaseModel from './base.model';

export const tableName = 'paypal_email';
export interface ITableStructure {
  [propname: string]: any
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  async getByStatus(status: string) {
    return this.$db.table(tableName).where({ status }).order('id', 'desc').limit(500).select();
  }

  async removeByIds(ids: string[]) {
    return this.$db.table(tableName).where('id in (?)', [ids]).delete();
  }

}

export default new DeviceModel();

