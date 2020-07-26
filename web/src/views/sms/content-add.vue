<template>
  <div class="dialog">
    <div class="dialog-cont">
      <div class="m10">
        请选择文件：
        <input type="file" ref="input" @change="upload" />
      </div>
      <div class="m10">
        归属设备
        <el-select v-model="category" size="mini" placeholder="选择" style="width: 100px;">
          <el-option v-for="it in device" :key="it.id" :label="it.device" :value="it.device" />
        </el-select>
      </div>
      <div class="m10">共发现内容{{ list.length }}条</div>
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
      list: [],
      device: [],
      category: ""
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      request({
        url: "/sms/device/list",
        method: "post",
        data: { status: undefined }
      }).then(res => {
        this.device = res.data;
        this.listLoading = false;
      });
    },
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
      if (!this.category) {
        return this.$message({
          message: "请选择归属设备",
          type: "warning"
        });
      }
      this.list.forEach(i => (i.device = this.category));
      request({
        url: "/sms/content/add",
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
        list = list.map(it => {
          return {
            content: it
          };
        });
        list = list.filter(i => i.content && i.content.length > 5);
        that.list = list;
      };
      reader.readAsText(file);
    }
  }
};
</script>
