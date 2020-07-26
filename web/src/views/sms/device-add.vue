<template>
  <div class="dialog">
    <div class="dialog-cont tac">
      <el-form ref="form" :model="form" label-width="160px" size="mini">
        <el-form-item
          label="归属设备:"
          prop="device"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.device" />
        </el-form-item>
        <el-form-item
          label="短信内容替换（条）:"
          prop="cont_replace_times"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.cont_replace_times" />
        </el-form-item>
        <el-form-item
          label="时间间隔（秒）:"
          prop="send_time_spacing"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.send_time_spacing" />
        </el-form-item>

        <el-form-item
          label="每次下载号码（个）:"
          prop="dw_phone_num"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.dw_phone_num" />
        </el-form-item>
        <el-form-item
          label="是否添加后缀："
          prop="is_add_suffix"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-select v-model="form.is_add_suffix" size="mini" placeholder="选择设备" style="width: 100%;">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="短信后缀内容: "
          prop="add_suffix_cont"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.add_suffix_cont" />
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
import request from "@/utils/request";
import parser from "cron-parser";

export default {
  props: ['form2'],
  data() {
    return {
      listLoading: false,
      valid_cron_time: false,
      scripts: [],
      form: {}
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
    if (this.form2) {
      this.form = this.form2;
    }
    this.getScripts();
  },
  methods: {
    cancel(data) {
      this.$emit("callback", data);
    },
    confirm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false;
        }
        this.listLoading = true;
        request({
          url: "/sms/device/add",
          method: "post",
          data: this.form
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
