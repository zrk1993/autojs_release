<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      <div>Autojs Web Control System</div>
      <div style="margin-top: 12px;text-align: center;">
        <a style="font-size: 14px" href="/qrcode_u.wechat.com.png" target="_blank">加我wx备注进交流群</a>
      </div
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
    margin-top: 2em;
    text-align: center;
  }
}
</style>
