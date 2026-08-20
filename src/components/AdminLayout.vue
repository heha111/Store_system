<template>
  <div class="admin-layout">
    <div class="sidebar">
      <div class="logo-area">
        <i class="el-icon-s-promotion logo-icon"></i>
        <span class="logo-text">门店管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :router="true"
        background-color="#FFFFFF"
        text-color="#606266"
        active-text-color="#2E7D32"
        class="side-menu"
      >
        <el-menu-item index="/admin/dashboard">
          <i class="el-icon-data-analysis"></i>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/admin/members">
          <i class="el-icon-user"></i>
          <span>会员管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <i class="el-icon-goods"></i>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/recharges">
          <i class="el-icon-money"></i>
          <span>充值记录</span>
        </el-menu-item>
        <el-menu-item index="/admin/cashier">
          <i class="el-icon-sell"></i>
          <span>模拟收银台</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <i class="el-icon-tickets"></i>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/stores">
          <i class="el-icon-office-building"></i>
          <span>门店管理</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="main-area">
      <div class="top-bar">
        <div class="top-bar-left">
          <span class="welcome-text">欢迎回来，{{ userName }}</span>
        </div>
        <div class="top-bar-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <i class="el-icon-user-solid"></i>
              {{ userName }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleLogout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AdminLayout',
  computed: {
    ...mapGetters(['userName']),
    activeMenu() {
      return this.$route.path
    }
  },
  methods: {
    ...mapActions(['logout']),
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.logout()
        this.$router.push('/login')
        this.$message.success('已退出登录')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #F0F9EB;
}

.sidebar {
  width: 220px;
  background: #FFFFFF;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #F0F9EB;
}

.logo-icon {
  font-size: 26px;
  color: #2E7D32;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #2E7D32;
}

.side-menu {
  border-right: none;
  flex: 1;
}

.side-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  border-left: 3px solid transparent;
}

.side-menu .el-menu-item.is-active {
  background-color: #F0F9EB !important;
  border-left: 3px solid #2E7D32;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  height: 60px;
  background: #FFFFFF;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.welcome-text {
  color: #909399;
  font-size: 14px;
}

.user-info {
  cursor: pointer;
  color: #2E7D32;
  font-size: 14px;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #F0F9EB;
}
</style>