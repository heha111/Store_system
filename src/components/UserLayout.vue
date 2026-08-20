<template>
  <div class="user-layout">
    <div class="top-nav">
      <div class="nav-left">
        <span class="nav-title" @click="$router.push('/user/home')">会员中心</span>
      </div>
      <div class="nav-right">
        <el-button type="text" @click="$router.push('/user/home')" class="home-btn">首页</el-button>
        <el-button type="text" @click="$router.push('/user/shop')" class="home-btn">购物</el-button>
        <span class="user-name">{{ userName }}</span>
        <el-button type="text" @click="handleLogout" class="logout-btn">退出登录</el-button>
      </div>
    </div>
    <div class="user-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'UserLayout',
  computed: {
    ...mapGetters(['userName'])
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
.user-layout {
  min-height: 100vh;
  background: #F0F9EB;
}

.top-nav {
  height: 56px;
  background: linear-gradient(90deg, #67C23A, #AED581);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-title {
  color: #FFFFFF;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  color: #FFFFFF;
  font-size: 14px;
}

.home-btn {
  color: #FFFFFF !important;
  font-size: 14px;
}

.logout-btn {
  color: #FFFFFF !important;
  font-size: 14px;
}

.user-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
</style>