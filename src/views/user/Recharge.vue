<template>
  <div class="user-recharge">
    <div class="card balance-card">
      <div class="balance-label">当前储值余额</div>
      <div class="balance-value">¥{{ balance }}</div>
    </div>

    <div class="card recharge-card">
      <div class="card-title">选择充值金额</div>
      <div class="preset-amounts">
        <div
          v-for="amount in presetAmounts"
          :key="amount"
          class="preset-item"
          :class="{ active: customAmount === amount }"
          @click="selectAmount(amount)"
        >
          ¥{{ amount }}
        </div>
      </div>
      <div class="custom-amount">
        <span class="custom-label">自定义金额：</span>
        <el-input
          v-model.number="customAmount"
          type="number"
          placeholder="请输入充值金额"
          size="medium"
          style="width: 200px"
          @input="onCustomInput"
        />
      </div>
      <div class="pay-method">
        <span class="method-label">支付方式：</span>
        <el-radio-group v-model="payMethod">
          <el-radio :label="1">微信支付</el-radio>
          <el-radio :label="2">支付宝</el-radio>
        </el-radio-group>
      </div>
      <el-button
        type="success"
        class="confirm-btn"
        size="large"
        :loading="loading"
        :disabled="!customAmount || customAmount <= 0"
        @click="handleRecharge"
      >
        确认充值 ¥{{ customAmount || 0 }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { doRecharge } from '@/api'

export default {
  name: 'UserRecharge',
  data() {
    return {
      balance: 0,
      presetAmounts: [100, 200, 500, 1000, 2000],
      customAmount: 100,
      payMethod: 1,
      loading: false
    }
  },
  mounted() {
    this.loadBalance()
  },
  methods: {
    ...mapActions(['getInfo']),
    async loadBalance() {
      try {
        const res = await this.getInfo()
        if (res.code === 200) {
          this.balance = res.data.balance || 0
        }
      } catch (e) {
        // 静默处理
      }
    },
    selectAmount(amount) {
      this.customAmount = amount
    },
    onCustomInput() {
      // 清除预设选中
    },
    async handleRecharge() {
      if (!this.customAmount || this.customAmount <= 0) {
        this.$message.warning('请输入充值金额')
        return
      }
      this.loading = true
      try {
        const res = await doRecharge({
          amount: this.customAmount,
          payMethod: this.payMethod
        })
        if (res.code === 200) {
          this.$message.success('充值成功')
          this.balance = (this.balance || 0) + this.customAmount
        } else {
          this.$message.error(res.message || '充值失败')
        }
      } catch (e) {
        this.$message.error('充值失败，请重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.card {
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.balance-card {
  text-align: center;
  padding: 30px;
}

.balance-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.balance-value {
  font-size: 36px;
  font-weight: 700;
  color: #4CAF50;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #4CAF50;
}

.preset-amounts {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.preset-item {
  width: 100px;
  height: 44px;
  border: 2px solid #E0E0E0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-item:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.preset-item.active {
  border-color: #4CAF50;
  background: #F0F9EB;
  color: #2E7D32;
}

.custom-amount {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.custom-label {
  font-size: 14px;
  color: #606266;
  margin-right: 12px;
}

.pay-method {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.method-label {
  font-size: 14px;
  color: #606266;
  margin-right: 12px;
}

.confirm-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
  letter-spacing: 2px;
}

.confirm-btn:hover:not(.is-disabled) {
  background: #2E7D32 !important;
  border-color: #2E7D32 !important;
}
</style>