import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import { getLock } from '@/utils/lock';
import db from '@/utils/db';
import * as joi from 'joi';
import * as moment from 'moment';
import Role from '@/decorators/role';
import SmsContentModel from '@/model/sms-content.model';
import SmsPhoneModel from '@/model/sms-phone.model';
import SmsDeviceModel from '@/model/sms-device.model';

@Controller('/sms')
@Description('sms')
export class SMS {
  @Post('/phone/list')
  @Role()
  async phonelist(@Body() body: any) {
    const res = await SmsPhoneModel.page(body.page || 1, body.size || 200);
    return ResultUtils.success(res);
  }

  @Post('/phone/add')
  @Role()
  async phoneadd(@Body() body: any) {
    await SmsPhoneModel.insert(body);
    return ResultUtils.success();
  }

  @Post('/phone/remove')
  @Role()
  async phoneremove(@Body() body: any) {
    await SmsPhoneModel.removeByIds(body.ids);
    return ResultUtils.success();
  }

  @Post('/phone/device')
  @Role()
  async phonerdevice(@Body() body: any) {
    await db.query(`UPDATE t_sms_phone SET device=? WHERE id =?`, [body.device, body.id]);
    return ResultUtils.success();
  }

  @Get('/phone/dw')
  async dw(@Query() query: any) {
    const lock = await getLock('/sms/phone/dw');
    try {
      const phones = await db.query(`SELECT * FROM t_sms_phone WHERE status = '未发送' AND device = ? LIMIT ?`, [query.devicename, +query.pagesize]);
      if (phones.length) {
        await db.query(`UPDATE t_sms_phone SET status='发送中' WHERE id in (?)`, [phones.map(i => i.id)]);
        return phones;
      } else {
        return ""
      }
    } catch (error) {
      throw error;
    } finally {
      lock && lock.release();
    }
  }

  @Post('/phone/up')
  async up(@Body() body: any) {
    if (body.tj && body.tj.length) {
      const d = JSON.parse(body.tj);
      d.forEach((p: any) => {
        db.query(`UPDATE t_sms_phone SET update_time=now(), status=? WHERE phone=?`, [p.status == 'ok' ? "成功" : "失败", p.phone]);
      });
    }
    return "";
  }


  @Post('/content/list')
  @Role()
  async contentlist(@Body() body: any) {
    const res = await SmsContentModel.getAll();
    return ResultUtils.success(res);
  }

  @Post('/content/add')
  @Role()
  async contentadd(@Body() body: any) {
    await SmsContentModel.insert(body);
    return ResultUtils.success();
  }

  @Post('/content/remove')
  @Role()
  async contentremove(@Body() body: any) {
    await SmsContentModel.removeByIds(body.ids);
    return ResultUtils.success();
  }

  @Post('/content/device')
  @Role()
  async contentdevice(@Body() body: any) {
    await db.query(`UPDATE t_sms_content SET device=? WHERE id =?`, [body.device, body.id]);
    return ResultUtils.success();
  }

  @Post('/content/get')
  async contentget(@Body() body: any) {
    const phones = await db.query(`SELECT * FROM t_sms_content WHERE device=? ORDER BY RAND() LIMIT 1`, [body.devicename]);
    return phones[0] ? phones[0].content : "";
  }

  @Post('/device/list')
  @Role()
  async devicelist(@Body() body: any) {
    const res = await SmsDeviceModel.getAll();
    return ResultUtils.success(res);
  }

  @Post('/device/add')
  @Role()
  async deviceadd(@Body() body: any) {
    const id = body.id;
    if (id) {
      delete body.visible;
      await db.table('sms_device').where({ id }).update(body);
    } else {
      await SmsDeviceModel.insert(body);
    }
    return ResultUtils.success();
  }

  @Post('/device/remove')
  @Role()
  async deviceremove(@Body() body: any) {
    await SmsDeviceModel.removeByIds(body.ids);
    return ResultUtils.success();
  }

  @Post('/device/config')
  async deviceconfig(@Body() body: any) {
    const phones = await db.query(`SELECT * FROM t_sms_device WHERE device=? LIMIT 1`, [body.devicename]);
    return phones[0] ? phones[0] : "";
  }

}
