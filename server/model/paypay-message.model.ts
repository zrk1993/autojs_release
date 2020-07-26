import BaseModel from './base.model';

export const tableName = 'paypal_message';
export interface ITableStructure {
  [propname: string]: any
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  async getMessages() {
    return this.$db.table(tableName).order('id', 'desc').select();
  }

  async removeByIds(ids: string[]) {
    return this.$db.table(tableName).where('id in (?)', [ids]).delete();
  }

}

export default new DeviceModel();

