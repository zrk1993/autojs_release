<template>
  <div class="app-container">
    <div class="header">
      <span>
        <el-button type="primary" size="mini" @click="schedulerAdd">导入留言</el-button>
        <el-popover v-model="popoverDelete" placement="top" width="120">
          <p class="tac">您确定删除吗？</p>
          <div class="tac m0">
            <el-button size="mini" type="text" @click="popoverDelete = false">取消</el-button>
            <el-button type="primary" size="mini" @click="removeSelected()">确定</el-button>
          </div>
          <el-button slot="reference" type="danger" size="mini">删除选择</el-button>
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
      <el-table-column label="留言ID" align="center">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column label="留言内容" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.message }}</span>
        </template>
      </el-table-column>
     

      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-popover v-model="scope.row.visible" placement="top" width="120">
            <p class="tac">您确定删除吗？</p>
            <div class="tac m0">
              <el-button size="mini" type="text" @click="scope.row.visible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="removeMessage(scope.row.id)">确定</el-button>
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

    <el-dialog :title="DLschedulerAdd.title" :visible.sync="DLschedulerAdd.visible" width="600px">
      <message-add v-if="DLschedulerAdd.visible" @callback="schedulerAddCb" />
    </el-dialog>
  </div>
</template>

<script>
import parser from "cron-parser";
import request from "@/utils/request";
import MessageAdd from "./message-add";

export default {
  filters: {
    statusFilter(status) {
      return status ? "success" : "gray";
    }
  },
  components: {
    MessageAdd
  },
  data() {
    return {
      popoverDelete: false,
      maxHeight: 500,
      list: [],
      listLoading: true,
      multipleSelection: [],
      DLschedulerAdd: {
        title: "新增留言内容",
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
      this.DLschedulerAdd.visible = true;
    },
    schedulerAddCb(data) {
      this.DLschedulerAdd.visible = false;
      if (data) this.fetchData();
    },
    fetchData() {
      this.listLoading = true;
      request({
        url: "/paypal/message/list",
        method: "post",
        data: { status: undefined }
      }).then(res => {
        this.list = res.data;
        this.listLoading = false;
      });
    },
    removeMessage(id) {
      this.listLoading = true;
      request({
        url: "/paypal/message/remove",
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
        url: "/paypal/message/remove",
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
