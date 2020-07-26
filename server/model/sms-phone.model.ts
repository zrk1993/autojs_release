import BaseModel from './base.model';

export const tableName = 'sms_phone';
export interface ITableStructure {
  [propname: string]: any
};

export class SmsPhoneModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  async getByStatus(status: string) {
    return this.$db.table(tableName).where({ status }).order('id', 'desc').limit(500).select();
  }

  async getAllData() {
    return this.$db.table(tableName).order('id', 'desc').limit(2000).select();
  }

  async removeByIds(ids: string[]) {
    return this.$db.table(tableName).where('id in (?)', [ids]).delete();
  }

}

export default new SmsPhoneModel();

