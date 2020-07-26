<template>
  <div class="dialog">
    <div class="dialog-cont">
      <div class="m10">
        请选择文件：
        <input type="file" ref="input" @change="upload" />
      </div>
      <div class="m10">共发现邮箱{{ list.length }}个</div>
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
  data() {
    return {
      listLoading: false,
      valid_cron_time: false,
      list: []
    };
  },
  created() {},
  methods: {
    cancel(data) {
      this.$emit("callback", data);
    },
    confirm() {
      this.listLoading = true;
      if (this.list.length === 0) {
        return this.$message({
          message: "请选择文件",
          type: "warning"
        });
      }
      request({
        url: "/paypal/email/add",
        method: "post",
        data: this.list
      }).then(res => {
        this.listLoading = false;
        this.cancel(res);
        this.$message({
          message: "操作成功！",
          type: "success"
        });
      });
    },
    upload() {
      const that = this;
      const input = this.$refs.input;
      const file = input.files[0];
      const filename = file.name.split(".")[0];
      const reader = new FileReader();
      reader.onload = function() {
        const res = this.result;
        let list = res.split(/\r\n/gi);
        list = list.map((it) => {
          return {
            email: it,
            status: '0'
          };
        });
        list = list.filter(i => i.email && i.email.length > 5);
        that.list = list;
      };
      reader.readAsText(file);
    }
  }
};
</script>
