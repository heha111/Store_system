<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-icon">
          <i class="el-icon-s-promotion"></i>
        </div>
        <h1 class="system-title">注册新账号</h1>
        <p class="system-subtitle">加入连锁门店会员系统</p>
      </div>
      <el-form ref="registerForm" :model="form" :rules="rules" class="register-form">
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
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="el-icon-lock"
            size="medium"
          />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称"
            prefix-icon="el-icon-postcard"
            size="medium"
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            prefix-icon="el-icon-phone"
            size="medium"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="register-btn"
            size="medium"
            :loading="loading"
            @click="handleRegister"
          >
            注 册
          </el-button>
        </el-form-item>
        <div class="login-link">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { register } from '@/api'

export default {
  name: 'Register',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        phone: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不少于 6 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (!valid) return
        this.loading = true
        try {
          const res = await register({
            username: this.form.username,
            password: this.form.password,
            nickname: this.form.nickname,
            phone: this.form.phone
          })
          if (res.code === 200) {
            this.$message.success('注册成功，请登录')
            this.$router.push('/login')
          } else {
            this.$message.error(res.message || '注册失败')
          }
        } catch (err) {
          this.$message.error('注册失败，请检查网络连接')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #F0F9EB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-card {
  width: 420px;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.register-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.logo-icon i {
  font-size: 28px;
  color: #FFFFFF;
}

.system-title {
  font-size: 20px;
  color: #2E7D32;
  margin: 0 0 6px 0;
  font-weight: 600;
}

.system-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.register-btn {
  width: 100%;
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
  font-size: 16px;
  letter-spacing: 4px;
}

.register-btn:hover {
  background: #2E7D32 !important;
  border-color: #2E7D32 !important;
}

.login-link {
  text-align: center;
  font-size: 13px;
  color: #909399;
}

.login-link a {
  color: #4CAF50;
  margin-left: 4px;
  text-decoration: none;
}

.login-link a:hover {
  color: #2E7D32;
}
</style>