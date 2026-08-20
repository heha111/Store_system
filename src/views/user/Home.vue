<template>
  <div class="user-home">
    <div class="header-card">
      <div class="header-bg">
        <div class="avatar-area">
          <div class="avatar">
            <i class="el-icon-user"></i>
          </div>
          <div class="user-name">{{ userName }}</div>
        </div>
        <div class="balance-row">
          <div class="balance-item">
            <div class="balance-label">储值余额</div>
            <div class="balance-value">¥{{ userInfo.balance || 0 }}</div>
          </div>
          <div class="balance-divider"></div>
          <div class="balance-item">
            <div class="balance-label">积分</div>
            <div class="balance-value points">{{ userInfo.points || 0 }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="func-grid">
      <div class="func-item" @click="$router.push('/user/shop')">
        <div class="func-icon">
          <i class="el-icon-shopping-cart-2"></i>
        </div>
        <div class="func-name">去购物</div>
      </div>
      <div class="func-item" @click="$router.push('/user/recharge')">
        <div class="func-icon">
          <i class="el-icon-money"></i>
        </div>
        <div class="func-name">去充值</div>
      </div>
      <div class="func-item" @click="$router.push('/user/mall')">
        <div class="func-icon">
          <i class="el-icon-present"></i>
        </div>
        <div class="func-name">去兑换</div>
      </div>
      <div class="func-item" @click="$router.push('/user/bills')">
        <div class="func-icon">
          <i class="el-icon-tickets"></i>
        </div>
        <div class="func-name">查账单</div>
      </div>
      <div class="func-item" @click="$router.push('/user/stores')">
        <div class="func-icon">
          <i class="el-icon-office-building"></i>
        </div>
        <div class="func-name">查门店</div>
      </div>
    </div>

    <div class="card activity-card">
      <div class="card-title">最近动态</div>
      <div class="activity-list" v-if="activities.length > 0">
        <div class="activity-item" v-for="(item, idx) in activities" :key="idx">
          <div class="activity-icon" :class="item.type === 'income' ? 'income' : 'expense'">
            <i :class="item.type === 'income' ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </div>
          <div class="activity-info">
            <div class="activity-desc">{{ item.desc }}</div>
            <div class="activity-time">{{ item.time }}</div>
          </div>
          <div class="activity-amount" :class="item.type === 'income' ? 'income' : 'expense'">
            {{ item.type === 'income' ? '+' : '-' }}{{ item.amount }}
          </div>
        </div>
      </div>
      <div v-else class="empty-activity">暂无动态</div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getBillList } from '@/api'

export default {
  name: 'UserHome',
  data() {
    return {
      userInfo: { balance: 0, points: 0 },
      activities: []
    }
  },
  computed: {
    ...mapGetters(['userName'])
  },
  mounted() {
    this.loadUserInfo()
    this.loadActivities()
  },
  methods: {
    ...mapActions(['getInfo']),
    async loadUserInfo() {
      try {
        const res = await this.getInfo()
        if (res.code === 200) {
          this.userInfo = res.data
        }
      } catch (e) {
        // 静默处理
      }
    },
    async loadActivities() {
      try {
        const res = await getBillList({ page: 1, pageSize: 5 })
        if (res.code === 200) {
          const list = res.data.records || res.data.list || []
          this.activities = list.map(item => ({
            type: item.type === 'recharge' ? 'income' : 'expense',
            desc: item.type === 'recharge' ? '充值' : (item.type === 'exchange' ? '积分兑换' : '消费'),
            amount: '¥' + (item.amount || 0).toFixed(2),
            time: item.createTime
          }))
        }
      } catch (e) {
        // 静默处理
      }
    }
  }
}
</script>

<style scoped>
.header-card {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.header-bg {
  background: linear-gradient(135deg, #67C23A, #AED581);
  padding: 30px;
  color: #FFFFFF;
}

.avatar-area {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.avatar i {
  font-size: 28px;
  color: #FFFFFF;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
}

.balance-row {
  display: flex;
  align-items: center;
}

.balance-item {
  flex: 1;
  text-align: center;
}

.balance-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.balance-value {
  font-size: 28px;
  font-weight: 700;
}

.balance-value.points {
  color: #FFF9C4;
}

.balance-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.4);
}

.func-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.func-item {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.func-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.15);
}

.func-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F0F9EB;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.func-icon i {
  font-size: 22px;
  color: #4CAF50;
}

.func-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.card {
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #4CAF50;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.activity-icon.income {
  background: #E8F5E9;
  color: #4CAF50;
}

.activity-icon.expense {
  background: #FFEBEE;
  color: #F56C6C;
}

.activity-info {
  flex: 1;
}

.activity-desc {
  font-size: 14px;
  color: #303133;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.activity-amount {
  font-size: 15px;
  font-weight: 600;
}

.activity-amount.income {
  color: #4CAF50;
}

.activity-amount.expense {
  color: #F56C6C;
}

.empty-activity {
  text-align: center;
  color: #909399;
  padding: 30px;
}
</style>