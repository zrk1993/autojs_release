import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import { getLock } from '@/utils/lock';
import db from '@/utils/db';
import * as joi from 'joi';
import * as moment from 'moment';
import Role from '@/decorators/role';
import PayPalAccountModel from '@/model/paypay-account.model';
import PayPalEmailModel from '@/model/paypay-email.model';
import PayPalMessageModel from '@/model/paypay-message.model';

@Controller('/paypal')
@Description('PayPal')
export class PayPal {
  @Post('/account/list')
  @Role()
  async accountlist(@Body() body: any) {
    const res = await PayPalAccountModel.getByStatus(body.status);
    return ResultUtils.success(res);
  }

  @Post('/account/add')
  @Role()
  async accountadd(@Body() body: any) {
    await PayPalAccountModel.insert(body);
    return ResultUtils.success();
  }

  @Post('/account/remove')
  @Role()
  async accountremove(@Body() body: any) {
    await PayPalAccountModel.removeByIds(body.ids);
    return ResultUtils.success();
  }

  @Post('/account/login')
  async accountgetlogin(@Body() body: any) {
    const lock = await getLock('/paypal/account/login');
    try {
      const accounts = await db.query(`SELECT * FROM t_paypal_account WHERE status = '正常' LIMIT 1`);
      if (accounts.length === 0) {
        throw new Error('PayPal账号不足');
      }

      const paypalAccount = accounts[0];

      await db.query(`UPDATE t_paypal_account SET status='使用中' WHERE id = ?`, [paypalAccount.id]);

      return ResultUtils.success({
        account_id: paypalAccount.id,
        account: paypalAccount.account,
        password: paypalAccount.password,
      });
    } catch (error) {
      throw error;
    } finally {
      lock && lock.release();
    }
  }

  @Post('/account/reset')
  async reset(@Body() body: any) {
    await db.query(`UPDATE t_paypal_account SET status='正常' WHERE id = ?`, [body.id]);
    return ResultUtils.success();
  }

  @Post('/account/logout')
  async accountgetlogout(@Body() body: any) {
    await db.query(`UPDATE t_paypal_account SET status='正常' WHERE id = ?`, [body.id]);
    return ResultUtils.success();
  }

  @Post('/account/abnormal')
  async accountgetabnormal(@Body() body: any) {
    await db.query(`UPDATE t_paypal_account SET status='异常' WHERE id = ?`, [body.id]);
    return ResultUtils.success();
  }

  @Post('/email/list')
  @Role()
  async emaillist(@Body() body: any) {
    const res = await PayPalEmailModel.getByStatus(body.status);
    return ResultUtils.success(res);
  }

  @Post('/email/add')
  @Role()
  async emailadd(@Body() body: any) {
    await PayPalEmailModel.insert(body);
    return ResultUtils.success();
  }

  @Post('/email/remove')
  @Role()
  async emailremove(@Body() body: any) {
    await PayPalEmailModel.removeByIds(body.ids);
    return ResultUtils.success();
  }

  @Post('/email/remove/send')
  @Role()
  async emailremovesend(@Body() body: any) {
    await db.query(`DELETE * FROM t_paypal_email WHERE status != '0'`);
    return ResultUtils.success();
  }

  @Post('/email/send/job')
  async emailrgetforsend(@Body() body: any) {
    const lock = await getLock('/paypal/email/getforsend');
    try {

      const emails = await db.query(`SELECT * FROM t_paypal_email WHERE status = '0' LIMIT 1`);
      if (emails.length === 0) {
        return ResultUtils.success({
          nojob: 1
        });
      }
      const paypalEmail = emails[0];
      await db.query(`UPDATE t_paypal_email SET status='1' WHERE id = ?`, [paypalEmail.id]);
      
      const msgs = await db.query(`SELECT * FROM t_paypal_message ORDER BY RAND() LIMIT 1`);
      const msg = msgs[0];

      return ResultUtils.success({
        email_id: paypalEmail.id,
        email: paypalEmail.email,
        amount: Math.ceil(Math.random() * 1000) + "",
        messgae: msg.message,
      });
    } catch (error) {
      throw error;
    } finally {
      lock && lock.release();
    }
  }

  @Post('/email/send/ok')
  async emailsend(@Body() body: any) {
    await db.query(`UPDATE t_paypal_email SET status='200', send_time=NOW() WHERE id = ?`, [body.id]);
    return ResultUtils.success();
  }

  @Post('/email/send/fail')
  async emailsendfail(@Body() body: any) {
    await db.query(`UPDATE t_paypal_email SET status='-1', send_time=NOW() WHERE id = ?`, [body.id]);
    return ResultUtils.success();
  }


  @Post('/message/list')
  @Role()
  async messagelist(@Body() body: any) {
    const res = await PayPalMessageModel.getMessages();
    return ResultUtils.success(res);
  }

  @Post('/message/add')
  @Role()
  async messageadd(@Body() body: any) {
    await PayPalMessageModel.insert(body);
    return ResultUtils.success();
  }

  @Post('/message/remove')
  @Role()
  async messageremove(@Body() body: any) {
    await PayPalMessageModel.removeByIds(body.ids);
    return ResultUtils.success();
  }

}
