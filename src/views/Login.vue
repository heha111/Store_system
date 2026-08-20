<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <i class="el-icon-s-promotion"></i>
        </div>
        <h1 class="system-title">连锁门店管理系统</h1>
        <p class="system-subtitle">会员积分与储值管理平台</p>
      </div>
      <el-form ref="loginForm" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            size="medium"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="medium"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="role">
          <el-radio-group v-model="form.role" class="role-group">
            <el-radio label="admin">管理员</el-radio>
            <el-radio label="user">会员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            size="medium"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
        <div class="register-link">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: '',
        role: 'admin'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) return
        this.loading = true
        try {
          // Mock 登录：任何账号密码都能登录
          await new Promise(resolve => setTimeout(resolve, 500))
          this.$message.success('登录成功（演示模式）')
          localStorage.setItem('token', 'mock-token-' + Date.now())
          if (this.form.role === 'admin') {
            this.$router.push('/admin/dashboard')
          } else {
            this.$router.push('/user/home')
          }
        } catch (err) {
          this.$message.error('登录失败，请重试')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #F0F9EB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 400px;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon i {
  font-size: 32px;
  color: #FFFFFF;
}

.system-title {
  font-size: 22px;
  color: #2E7D32;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.system-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-top: 24px;
}

.role-group {
  display: flex;
  justify-content: center;
  width: 100%;
}

.login-btn {
  width: 100%;
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
  font-size: 16px;
  letter-spacing: 4px;
}

.login-btn:hover {
  background: #2E7D32 !important;
  border-color: #2E7D32 !important;
}

.register-link {
  text-align: center;
  font-size: 13px;
  color: #909399;
}

.register-link a {
  color: #4CAF50;
  margin-left: 4px;
  text-decoration: none;
}

.register-link a:hover {
  color: #2E7D32;
}
</style>