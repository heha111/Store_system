<template>
  <div class="user-mall">
    <div class="card points-card">
      <div class="points-label">我的积分</div>
      <div class="points-value">{{ points }}</div>
    </div>

    <div class="card rules-card">
      <div class="rules-title">积分规则</div>
      <div class="rules-content">
        <div class="rule-item">
          <i class="el-icon-plus rule-icon earn"></i>
          <span>在门店消费时可获得积分，积分倍率由商品决定（每消费 1 元获得 1 积分）</span>
        </div>
        <div class="rule-item">
          <i class="el-icon-present rule-icon spend"></i>
          <span>积分可用于兑换下方礼品，兑换后积分即时扣除</span>
        </div>
        <div class="rule-item">
          <i class="el-icon-info rule-icon info"></i>
          <span>积分不可提现、不可转让，仅限本人使用</span>
        </div>
      </div>
    </div>

    <div class="card mall-card">
      <div class="card-title">积分商城</div>
      <div class="gift-grid" v-if="gifts.length > 0">
        <div class="gift-card" v-for="gift in gifts" :key="gift.id">
          <div class="gift-image">
            <i class="el-icon-present"></i>
          </div>
          <div class="gift-name">{{ gift.name }}</div>
          <div class="gift-points">{{ gift.pointsRequired || gift.price }} 积分</div>
          <el-button
            type="success"
            size="small"
            class="exchange-btn"
            :disabled="points < (gift.pointsRequired || gift.price)"
            @click="handleExchange(gift)"
          >
            立即兑换
          </el-button>
        </div>
      </div>
      <div v-else class="empty-gifts">暂无礼品</div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getGifts, exchange } from '@/api'

export default {
  name: 'UserMall',
  data() {
    return {
      points: 0,
      gifts: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    ...mapActions(['getInfo']),
    async loadData() {
      try {
        const res = await this.getInfo()
        if (res.code === 200) {
          this.points = res.data.points || 0
        }
      } catch (e) {
        // 静默处理
      }
      try {
        const res = await getGifts()
        if (res.code === 200) {
          this.gifts = (res.data && res.data.records) ? res.data.records : []
        }
      } catch (e) {
        // 静默处理
      }
    },
    handleExchange(gift) {
      const required = gift.pointsRequired || gift.price
      this.$confirm(`确定使用 ${required} 积分兑换「${gift.name}」吗？`, '确认兑换', {
        confirmButtonText: '确定兑换',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const res = await exchange({
            productId: gift.id
          })
          if (res.code === 200) {
            this.$message.success('兑换成功')
            this.points -= required
          } else {
            this.$message.error(res.message || '兑换失败')
          }
        } catch (e) {
          this.$message.error('兑换失败，请重试')
        }
      }).catch(() => {})
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

.points-card {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #F0F9EB, #FFFFFF);
}

.points-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.points-value {
  font-size: 32px;
  font-weight: 700;
  color: #E6A23C;
}

.rules-card {
  background: #F0F9EB;
}

.rules-title {
  font-size: 15px;
  font-weight: 600;
  color: #2E7D32;
  margin-bottom: 12px;
}

.rules-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.rule-icon {
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.rule-icon.earn {
  color: #4CAF50;
}

.rule-icon.spend {
  color: #E6A23C;
}

.rule-icon.info {
  color: #909399;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #4CAF50;
}

.gift-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.gift-card {
  background: #FAFFFA;
  border: 1px solid #E8F5E9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;
}

.gift-card:hover {
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.12);
  transform: translateY(-2px);
}

.gift-image {
  width: 64px;
  height: 64px;
  background: #F0F9EB;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.gift-image i {
  font-size: 30px;
  color: #4CAF50;
}

.gift-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 500;
}

.gift-points {
  font-size: 16px;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 12px;
}

.exchange-btn {
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
}

.exchange-btn:hover:not(.is-disabled) {
  background: #2E7D32 !important;
  border-color: #2E7D32 !important;
}

.empty-gifts {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>