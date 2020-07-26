<template>
  <div class="app-container">
    <div class="header">
      <span>
        <el-button type="primary" size="mini" @click="schedulerAdd">导入邮箱</el-button>
        <el-popover v-model="popoverDelete" placement="top" width="120">
          <p class="tac">您确定删除吗？</p>
          <div class="tac m0">
            <el-button size="mini" type="text" @click="popoverDelete = false">取消</el-button>
            <el-button type="primary" size="mini" @click="removeSelected()">确定</el-button>
          </div>
          <el-button slot="reference" type="danger" size="mini">删除选择</el-button>
        </el-popover>
        <el-popover v-model="popoverDeleteSend" placement="top" width="120">
          <p class="tac">您确定删除吗？</p>
          <div class="tac m0">
            <el-button size="mini" type="text" @click="popoverDelete = false">取消</el-button>
            <el-button type="primary" size="mini" @click="removeSend()">确定</el-button>
          </div>
          <el-button slot="reference" type="danger" size="mini">删除已发送</el-button>
        </el-popover>
      </span>
      <span></span>
    </div>
    <el-table
      v-loading="listLoading"
      v-auto-height:maxHeight="-20"
      :max-height="maxHeight"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="邮箱ID" align="center">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column label="邮箱" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column> -->
      <el-table-column align="center" prop="create_time" label="邮件发送时间">
        <template slot-scope="scope">
          <span v-if="scope.row.send_time">{{ scope.row.send_time | time }}</span>
          <span v-else>未发送</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-popover v-model="scope.row.visible" placement="top" width="120">
            <p class="tac">您确定删除吗？</p>
            <div class="tac m0">
              <el-button size="mini" type="text" @click="scope.row.visible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="removeScheduler(scope.row.id)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="mini" />
          </el-popover>
          <!-- <el-button
            class="ml5"
            type="primary"
            icon="el-icon-video-play"
            circle
            size="mini"
            @click="startScheduler(scope.row.scheduler_id)"
          />-->
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="DLemailAdd.title" :visible.sync="DLemailAdd.visible" width="600px">
      <email-add v-if="DLemailAdd.visible" @callback="schedulerAddCb" />
    </el-dialog>
  </div>
</template>

<script>
import parser from "cron-parser";
import request from "@/utils/request";
import EmailAdd from "./email-add";

export default {
  filters: {
    statusFilter(status) {
      return status ? "success" : "gray";
    }
  },
  components: {
    EmailAdd
  },
  data() {
    return {
      popoverDelete: false,
      popoverDeleteSend: false,
      maxHeight: 500,
      list: [],
      listLoading: true,
      multipleSelection: [],
      DLemailAdd: {
        title: "新增邮箱",
        visible: false
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    nextRunTime(cron_time) {
      try {
        const interval = parser.parseExpression(cron_time);
        return interval.next().toString();
      } catch (err) {
        return err.message;
      }
    },
    schedulerAdd() {
      this.DLemailAdd.visible = true;
    },
    schedulerAddCb(data) {
      this.DLemailAdd.visible = false;
      if (data) this.fetchData();
    },
    fetchData() {
      this.listLoading = true;
      request({
        url: "/paypal/email/list",
        method: "post",
        data: { status: undefined }
      }).then(res => {
        this.list = res.data;
        this.listLoading = false;
      });
    },
    removeScheduler(id) {
      this.listLoading = true;
      request({
        url: "/paypal/email/remove",
        method: "post",
        data: { ids: [id] }
      })
        .then(res => {
          this.fetchData();
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    removeSend() {
      this.listLoading = true;
      request({
        url: "/paypal/email/remove/send",
        method: "post",
        data: {}
      })
        .then(res => {
          this.fetchData();
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    removeSelected() {
      this.popoverDelete = false;

      if (this.multipleSelection.length === 0) {
        return this.$message({
          message: "请选择",
          type: "warning"
        });
      }
      this.listLoading = true;
      const ids = this.multipleSelection.map(i => String(i.id));
      request({
        url: "/paypal/email/remove",
        method: "post",
        data: { ids }
      })
        .then(res => {
          this.fetchData();
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  }
};
</script>

<style scoped>
.header {
  font-weight: 600;
  font-size: 16px;
  color: #909399;
  display: flex;
  padding: 5px 0;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
