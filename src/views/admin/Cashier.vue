<template>
  <div class="cashier-page">
    <div class="cashier-left">
      <div class="card product-section">
        <div class="section-title">商品列表</div>
        <div class="product-grid">
          <div class="product-card" v-for="item in products" :key="item.id" @click="addToCart(item)">
            <div class="product-name">{{ item.name }}</div>
            <div class="product-price">¥{{ item.price }}</div>
            <el-button type="success" size="mini" class="add-btn">加入购物车</el-button>
          </div>
          <div v-if="products.length === 0" class="empty-tip">暂无可用商品</div>
        </div>
      </div>
    </div>
    <div class="cashier-right">
      <div class="card cart-section">
        <div class="section-title">购物车</div>
        <div class="cart-list" v-if="cart.length > 0">
          <div class="cart-item" v-for="(item, index) in cart" :key="index">
            <div class="cart-item-name">{{ item.name }}</div>
            <div class="cart-item-qty">
              <el-button size="mini" icon="el-icon-minus" circle @click="changeQty(index, -1)" />
              <span class="qty-num">{{ item.qty }}</span>
              <el-button size="mini" icon="el-icon-plus" circle @click="changeQty(index, 1)" />
            </div>
            <div class="cart-item-price">¥{{ (item.price * item.qty).toFixed(2) }}</div>
            <el-button type="text" size="mini" style="color: #F56C6C" icon="el-icon-delete" @click="removeItem(index)" />
          </div>
        </div>
        <div v-else class="empty-cart">购物车为空</div>
        <div class="cart-total" v-if="cart.length > 0">
          <span>合计：</span>
          <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="card member-section">
        <div class="section-title">会员搜索</div>
        <div class="member-search">
          <el-input v-model="phone" placeholder="输入会员手机号搜索" clearable>
            <el-button slot="append" @click="searchMember">搜索</el-button>
          </el-input>
        </div>
        <div class="member-info" v-if="member">
          <div class="member-row">
            <span class="member-label">会员：</span>
            <span>{{ member.nickname || member.username }}</span>
          </div>
          <div class="member-row">
            <span class="member-label">余额：</span>
            <span class="money">¥{{ member.balance || 0 }}</span>
          </div>
          <div class="member-row">
            <span class="member-label">积分：</span>
            <span class="points">{{ member.points || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="card pay-section">
        <div class="section-title">支付</div>
        <div class="pay-form" v-if="member">
          <div class="pay-row">
            <span class="pay-label">储值支付：</span>
            <el-input v-model.number="balancePay" type="number" size="medium" placeholder="0" style="width: 160px" />
          </div>
          <div class="pay-row">
            <span class="pay-label">积分抵扣：</span>
            <el-input v-model.number="pointsPay" type="number" size="medium" placeholder="0" style="width: 160px" />
            <span class="pay-hint">（100积分=1元）</span>
          </div>
          <div class="pay-row">
            <span class="pay-label">实付：</span>
            <span class="pay-amount">¥{{ realPay }}</span>
          </div>
          <div class="pay-validation" v-if="validationMsg">
            <span class="error-msg">{{ validationMsg }}</span>
          </div>
        </div>
        <div class="pay-form" v-else>
          <p class="no-member-hint">请先搜索会员</p>
        </div>
        <el-button
          type="success"
          class="pay-btn"
          :disabled="!canPay"
          :loading="paying"
          @click="handlePay"
        >
          确认支付
        </el-button>
      </div>
    </div>

    <el-dialog title="收据" :visible.sync="receiptVisible" width="400px">
      <div class="receipt" v-if="receiptData">
        <div class="receipt-header">
          <h3>消费收据</h3>
          <p>订单号：{{ receiptData.orderNo }}</p>
        </div>
        <div class="receipt-items">
          <div class="receipt-item" v-for="(item, idx) in receiptData.items" :key="idx">
            <span>{{ item.name }} x{{ item.qty }}</span>
            <span>¥{{ (item.price * item.qty).toFixed(2) }}</span>
          </div>
        </div>
        <div class="receipt-summary">
          <div class="receipt-row">
            <span>储值支付</span><span>¥{{ receiptData.balancePay || 0 }}</span>
          </div>
          <div class="receipt-row">
            <span>积分抵扣</span><span>{{ receiptData.pointsPay || 0 }}积分</span>
          </div>
          <div class="receipt-row total">
            <span>合计</span><span>¥{{ receiptData.totalAmount }}</span>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" class="green-btn" @click="receiptVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAvailable, getList, doConsume } from '@/api'

export default {
  name: 'Cashier',
  data() {
    return {
      products: [],
      cart: [],
      phone: '',
      member: null,
      balancePay: 0,
      pointsPay: 0,
      paying: false,
      receiptVisible: false,
      receiptData: null
    }
  },
  computed: {
    totalAmount() {
      return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    },
    realPay() {
      const bp = this.balancePay || 0
      const pp = (this.pointsPay || 0) * 0.01
      return (bp + pp).toFixed(2)
    },
    validationMsg() {
      if (!this.member) return ''
      const bp = this.balancePay || 0
      const pp = (this.pointsPay || 0) * 0.01
      const total = this.totalAmount
      if (total <= 0) return '请添加商品到购物车'
      const realPay = bp + pp
      if (realPay < total) return '支付金额不足，请调整储值或积分'
      if (bp > 0 && this.member.balance < bp) return '储值余额不足'
      if (pp > 0 && this.member.points < (this.pointsPay || 0)) return '积分不足'
      return ''
    },
    canPay() {
      return this.member && this.cart.length > 0 && !this.validationMsg && !this.paying
    }
  },
  mounted() {
    this.loadProducts()
  },
  methods: {
    async loadProducts() {
      try {
        const res = await getAvailable()
        if (res.code === 200) {
          this.products = res.data || []
        }
      } catch (e) {
        try {
          const res = await getList({ page: 1, pageSize: 100 })
          if (res.code === 200) {
            this.products = (res.data.records || res.data.list || []).filter(p => p.status === 1)
          }
        } catch (e2) {
          // 静默处理
        }
      }
    },
    addToCart(product) {
      const exist = this.cart.find(item => item.id === product.id)
      if (exist) {
        exist.qty++
      } else {
        this.cart.push({ ...product, qty: 1 })
      }
    },
    changeQty(index, delta) {
      const item = this.cart[index]
      item.qty += delta
      if (item.qty <= 0) {
        this.cart.splice(index, 1)
      }
    },
    removeItem(index) {
      this.cart.splice(index, 1)
    },
    async searchMember() {
      if (!this.phone) {
        this.$message.warning('请输入手机号')
        return
      }
      try {
        const res = await getList({ keyword: this.phone, page: 1, pageSize: 1 })
        if (res.code === 200) {
          const list = res.data.records || res.data.list || []
          if (list.length > 0) {
            this.member = list[0]
            this.$message.success('找到会员')
          } else {
            this.$message.warning('未找到该会员')
            this.member = null
          }
        }
      } catch (e) {
        this.$message.error('搜索失败')
      }
    },
    async handlePay() {
      if (!this.canPay) return
      this.paying = true
      try {
        const res = await doConsume({
          userId: this.member.id,
          items: this.cart.map(item => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.qty
          })),
          balancePay: this.balancePay || 0,
          pointsPay: this.pointsPay || 0,
          totalAmount: this.totalAmount
        })
        if (res.code === 200) {
          this.$message.success('支付成功')
          this.receiptData = {
            orderNo: res.data.orderNo || 'N/A',
            items: this.cart,
            balancePay: this.balancePay || 0,
            pointsPay: this.pointsPay || 0,
            totalAmount: this.totalAmount.toFixed(2)
          }
          this.receiptVisible = true
          this.resetPay()
        } else {
          this.$message.error(res.message || '支付失败')
        }
      } catch (e) {
        this.$message.error('支付失败，请重试')
      } finally {
        this.paying = false
      }
    },
    resetPay() {
      this.cart = []
      this.member = null
      this.phone = ''
      this.balancePay = 0
      this.pointsPay = 0
    }
  }
}
</script>

<style scoped>
.cashier-page {
  display: flex;
  gap: 20px;
  height: calc(100vh - 100px);
}

.cashier-left {
  flex: 1;
  overflow-y: auto;
}

.cashier-right {
  width: 350px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.card {
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.cart-section, .member-section {
  background: #FAFFFA;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #4CAF50;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.product-card {
  background: #FAFFFA;
  border: 1px solid #E8F5E9;
  border-radius: 6px;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 6px;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 10px;
}

.add-btn {
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
}

.empty-tip {
  grid-column: 1 / -1;
  text-align: center;
  color: #909399;
  padding: 40px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E8F5E9;
  gap: 8px;
}

.cart-item-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-qty {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-num {
  display: inline-block;
  width: 24px;
  text-align: center;
  font-size: 13px;
}

.cart-item-price {
  font-size: 13px;
  color: #4CAF50;
  font-weight: 600;
  width: 60px;
  text-align: right;
}

.empty-cart {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 13px;
}

.cart-total {
  margin-top: 12px;
  text-align: right;
  padding-top: 8px;
  border-top: 1px solid #E8F5E9;
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
  color: #4CAF50;
}

.member-search {
  margin-bottom: 12px;
}

.member-info {
  padding: 10px;
  background: #F0F9EB;
  border-radius: 4px;
}

.member-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 13px;
}

.member-label {
  color: #909399;
  width: 50px;
}

.money {
  color: #4CAF50;
  font-weight: 600;
}

.points {
  color: #E6A23C;
  font-weight: 600;
}

.pay-form {
  margin-bottom: 12px;
}

.pay-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.pay-label {
  color: #606266;
  width: 80px;
}

.pay-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.pay-amount {
  font-size: 20px;
  font-weight: 700;
  color: #4CAF50;
}

.pay-validation {
  margin-top: 8px;
}

.error-msg {
  color: #F56C6C;
  font-size: 12px;
}

.no-member-hint {
  color: #909399;
  text-align: center;
  font-size: 13px;
  padding: 10px;
}

.pay-btn {
  width: 100%;
  height: 42px;
  font-size: 16px;
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
  letter-spacing: 4px;
}

.pay-btn:hover:not(.is-disabled) {
  background: #2E7D32 !important;
  border-color: #2E7D32 !important;
}

.receipt-header {
  text-align: center;
  margin-bottom: 16px;
}

.receipt-header h3 {
  margin: 0 0 4px 0;
  color: #2E7D32;
}

.receipt-header p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.receipt-items {
  border-top: 1px dashed #E0E0E0;
  border-bottom: 1px dashed #E0E0E0;
  padding: 10px 0;
}

.receipt-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
}

.receipt-summary {
  margin-top: 10px;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
}

.receipt-row.total {
  font-weight: 700;
  font-size: 15px;
  color: #4CAF50;
  border-top: 1px solid #E0E0E0;
  padding-top: 8px;
  margin-top: 4px;
}

.green-btn {
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
}
</style>