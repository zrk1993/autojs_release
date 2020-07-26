<template>
  <div class="dialog">
    <div class="dialog-cont tac">
      <el-form ref="form" :model="form" label-width="130px" size="mini">
        <el-form-item
          label="计划名称："
          prop="scheduler_name"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.scheduler_name" />
        </el-form-item>
        <el-form-item
          label="执行脚本："
          prop="script_id"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-select v-model="form.script_id" size="mini" placeholder="选择脚本" style="width: 100%;">
            <el-option
              v-for="item in scripts"
              :key="item.script_id"
              :label="item.script_name"
              :value="item.script_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="设备分组："
          prop="category"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-select v-model="form.category" size="mini" placeholder="选择分组" style="width: 100%;">
            <el-option
              v-for="category in $store.state.device.category"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="日期："
          prop="scheduler_date"
          :rules="[
            { required: true, message: '请选择', trigger: ['blur', 'change'] },
          ]"
        >
          <div class="tal">
            <el-date-picker
              v-model="form.scheduler_date"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item
          label="时间："
          prop="scheduler_time"
          :rules="[
            { required: true, message: '请选择', trigger: ['blur', 'change'] },
          ]"
        >
          <div class="tal">
            <el-time-picker            
              format="HH:mm"
              arrow-control
              v-model="form.scheduler_time"
              placeholder="选择时间点">
            </el-time-picker>
          </div>
        </el-form-item>
        <el-form-item
          label="循环方式："
          prop="scheduler_type"
          :rules="[
            { required: true, message: '请选择', trigger: ['blur', 'change'] },
          ]"
        >
          <div class="tal">
            <div>
              <el-radio v-model="form.scheduler_type" label="1">单次</el-radio>
            </div>
            <div>
              <el-radio v-model="form.scheduler_type" label="2">每天</el-radio>
            </div>
            <div>
              <el-radio v-model="form.scheduler_type" label="3">按分钟</el-radio>
              <span>每隔</span>
              <el-input v-model="form.every_minute" size="mini" class="w120"></el-input>
              <span>分钟</span>
            </div>
            <div>
              <el-radio v-model="form.scheduler_type" label="4">按小时</el-radio>
              <span>每隔</span>
              <el-input v-model="form.every_hour" size="mini" class="w120"></el-input>
              <span>小时</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="tar">
      <el-button size="mini" @click="cancel">取 消</el-button>
      <el-button size="mini" type="primary" :list-loading="listLoading" @click="confirm">确 定</el-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import request from "@/utils/request";
import parser from "cron-parser";

export default {
  data() {
    return {
      listLoading: false,
      valid_cron_time: false,
      scripts: [],
      form: {
        cron_time: "* * * * *",
        scheduler_type: '1',
      }
    };
  },
  computed: {
    nextRunTime() {
      try {
        const interval = parser.parseExpression(this.form.cron_time);
        this.valid_cron_time = true;
        return interval.next().toString();
      } catch (err) {
        this.valid_cron_time = false;
        return err.message;
      }
    }
  },
  created() {
    this.getScripts();
  },
  methods: {
    cancel(data) {
      this.$emit("callback", data);
    },

    parserCron() {
      const scheduler_date = moment(this.form.scheduler_date);
      if (this.form.scheduler_type === '1') {
        const cron = `${this.form.scheduler_time.getMinutes()} ${this.form.scheduler_time.getHours()} ${scheduler_date.date()} ${scheduler_date.month()} *`;
        return cron;
      }

      if (this.form.scheduler_type === '2') {
        const cron = `${this.form.scheduler_time.getMinutes()} ${this.form.scheduler_time.getHours()} * * *`;
        return cron;
      }

      if (this.form.scheduler_type === '3') {
        const cron = `*/${this.form.every_minute} * * * *`;
        return cron;
      }

      if (this.form.scheduler_type === '4') {
        const cron = `* */${this.form.every_hour} * * *`;
        return cron;
      }

    },

    confirm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false;
        }

        const cron = this.parserCron();
        console.log(cron);
        this.listLoading = true;
        request({
          url: "/scheduler/add_scheduler",
          method: "post",
          data: {
            scheduler_name: this.form.scheduler_name,
            cron_time: cron,
            script_id: this.form.script_id,
            category: this.form.category
          }
        }).then(res => {
          this.listLoading = false;
          this.cancel(res);
          this.$message({
            message: "操作成功！",
            type: "success"
          });
        });
      });
    },
    getScripts() {
      this.listLoading = true;
      request({
        url: "/script/get_script_list",
        method: "get",
        params: {}
      }).then(res => {
        this.scripts = res.data.scripts;
        this.listLoading = false;
      });
    }
  }
};
</script>