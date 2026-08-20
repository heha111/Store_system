<template>
  <div class="user-bills">
    <div class="card">
      <div class="card-title">账单记录</div>
      <div class="bill-list" v-if="bills.length > 0">
        <div class="bill-item" v-for="(item, idx) in bills" :key="idx">
          <div class="bill-icon" :class="item._type === 'income' ? 'income' : 'expense'">
            <i :class="item._type === 'income' ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </div>
          <div class="bill-info">
            <div class="bill-desc">
              <span class="bill-type-tag" :class="item._type">{{ item._typeLabel }}</span>
              {{ item._desc }}
            </div>
            <div class="bill-detail" v-if="item._detail">{{ item._detail }}</div>
            <div class="bill-time">{{ item._time }}</div>
          </div>
          <div class="bill-amount" :class="item._type === 'income' ? 'income' : 'expense'">
            {{ item._amount }}
          </div>
        </div>
      </div>
      <div v-else class="empty-bills">暂无账单记录</div>
    </div>
  </div>
</template>

<script>
import { getBillList } from '@/api'

export default {
  name: 'UserBills',
  data() {
    return {
      bills: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await getBillList({ page: 1, pageSize: 50 })
        if (res.code === 200) {
          const list = res.data.records || res.data.list || []
          this.bills = list.map(item => {
            const isIncome = item.type === 'recharge'
            let desc = ''
            let detail = ''
            let amount = ''

            if (item.type === 'recharge') {
              desc = '储值充值'
              amount = '¥' + (item.amount || 0).toFixed(2)
            } else if (item.type === 'consume') {
              desc = '门店消费'
              const parts = []
              if (item.balancePay && parseFloat(item.balancePay) > 0) {
                parts.push('储值支付 ¥' + parseFloat(item.balancePay).toFixed(2))
              }
              if (item.pointsPay && parseInt(item.pointsPay) > 0) {
                parts.push('积分抵扣 ' + item.pointsPay + ' 分')
              }
              detail = parts.join('，') || '订单号：' + (item.orderNo || '')
              amount = '¥' + (item.amount || 0).toFixed(2)
            } else if (item.type === 'exchange') {
              desc = '积分兑换礼品'
              detail = '消耗 ' + (item.pointsPay || 0) + ' 积分'
              amount = '¥' + (item.amount || 0).toFixed(2)
            }

            return {
              ...item,
              _type: isIncome ? 'income' : 'expense',
              _typeLabel: item.typeLabel || '',
              _desc: desc,
              _detail: detail,
              _amount: isIncome ? ('+' + amount) : ('-' + amount),
              _time: item.createTime || item.time
            }
          })
        }
      } catch (e) {
        // 静默处理
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
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #4CAF50;
}

.bill-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #F5F5F5;
}

.bill-item:last-child {
  border-bottom: none;
}

.bill-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  font-size: 18px;
}

.bill-icon.income {
  background: #E8F5E9;
  color: #4CAF50;
}

.bill-icon.expense {
  background: #FFEBEE;
  color: #F56C6C;
}

.bill-info {
  flex: 1;
}

.bill-desc {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bill-type-tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.bill-type-tag.income {
  background: #E8F5E9;
  color: #4CAF50;
}

.bill-type-tag.expense {
  background: #FFEBEE;
  color: #F56C6C;
}

.bill-detail {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.bill-time {
  font-size: 12px;
  color: #909399;
}

.bill-amount {
  font-size: 16px;
  font-weight: 600;
}

.bill-amount.income {
  color: #4CAF50;
}

.bill-amount.expense {
  color: #F56C6C;
}

.empty-bills {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>