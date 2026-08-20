<template>
  <div class="shop-page">
    <div class="shop-layout">
      <!-- 左侧商品区 -->
      <div class="product-area">
        <div class="card">
          <div class="card-title">商品选购</div>
          <div class="product-grid" v-if="products.length > 0">
            <div class="product-item" v-for="p in products" :key="p.id" @click="addToCart(p)">
              <div class="product-img">
                <img :src="getProductImage(p)" @error="onImgError" />
              </div>
              <div class="product-name">{{ p.name }}</div>
              <div class="product-price">¥{{ p.price }}</div>
              <div class="product-stock">库存: {{ p.stock }}</div>
            </div>
          </div>
          <div v-else class="empty">暂无商品</div>
        </div>
      </div>

      <!-- 右侧购物车 -->
      <div class="cart-area">
        <div class="card cart-card">
          <div class="card-title">购物车</div>
          <div class="cart-list" v-if="cart.length > 0">
            <div class="cart-item" v-for="(item, idx) in cart" :key="idx">
              <div class="cart-item-name">{{ item.name }}</div>
              <div class="cart-item-qty">
                <el-button size="mini" circle icon="el-icon-minus" @click="changeQty(idx, -1)" />
                <span class="qty-num">{{ item.qty }}</span>
                <el-button size="mini" circle icon="el-icon-plus" @click="changeQty(idx, 1)" />
              </div>
              <div class="cart-item-price">¥{{ (item.price * item.qty).toFixed(2) }}</div>
              <el-button type="text" size="mini" style="color:#F56C6C" icon="el-icon-delete" @click="removeItem(idx)" />
            </div>
          </div>
          <div v-else class="empty-cart">购物车为空，点击左侧商品添加</div>

          <div class="cart-total" v-if="cart.length > 0">
            <span>合计：</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 支付区 -->
        <div class="card pay-card" v-if="cart.length > 0">
          <div class="card-title">支付</div>
          <div class="user-info-row">
            <span>当前余额：</span>
            <span class="balance-highlight">¥{{ userInfo.balance || 0 }}</span>
            <span class="divider">|</span>
            <span>积分：</span>
            <span class="points-highlight">{{ userInfo.points || 0 }}</span>
            <span class="points-hint">（每100积分抵1元）</span>
          </div>
          <div class="pay-row">
            <div class="pay-field">
              <label>储值支付</label>
              <el-input-number v-model="balancePay" :min="0" :max="Math.min(userInfo.balance || 0, totalPrice)" :precision="2" :step="1" controls-position="right" />
            </div>
            <div class="pay-field">
              <label>积分抵扣</label>
              <el-input-number v-model="pointsPay" :min="0" :max="Math.min(userInfo.points || 0, 10000)" :step="100" controls-position="right" />
              <span class="points-desc">= ¥{{ (pointsPay / 100).toFixed(2) }}</span>
            </div>
          </div>
          <div class="pay-remain" v-if="remainAmount > 0">
            剩余待付：<span class="remain-warn">¥{{ remainAmount.toFixed(2) }}</span>
          </div>
          <el-button type="primary" class="pay-btn" @click="submitOrder" :disabled="remainAmount > 0 || cart.length === 0">
            确认支付 ¥{{ totalPrice.toFixed(2) }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getAvailable, doConsume } from '@/api'

export default {
  name: 'UserShop',
  data() {
    return {
      products: [],
      cart: [],
      balancePay: 0,
      pointsPay: 0,
      userInfo: { balance: 0, points: 0 }
    }
  },
  computed: {
    ...mapGetters(['userName']),
    totalPrice() {
      return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    },
    remainAmount() {
      const paid = this.balancePay + this.pointsPay / 100
      return Math.max(0, this.totalPrice - paid)
    }
  },
  mounted() {
    this.loadUserInfo()
    this.loadProducts()
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
    async loadProducts() {
      try {
        const res = await getAvailable()
        if (res.code === 200 && res.data) {
          this.products = res.data || []
        }
      } catch (e) {
        this.$message.error('加载商品失败')
      }
    },
    addToCart(product) {
      const exist = this.cart.find(item => item.id === product.id)
      if (exist) {
        if (exist.qty >= product.stock) {
          this.$message.warning('库存不足')
          return
        }
        exist.qty++
      } else {
        this.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          stock: product.stock,
          pointsRate: product.pointsRate || 1
        })
      }
      this.$message.success('已添加到购物车')
    },
    changeQty(idx, delta) {
      const item = this.cart[idx]
      const newQty = item.qty + delta
      if (newQty < 1) {
        this.cart.splice(idx, 1)
      } else if (newQty > item.stock) {
        this.$message.warning('库存不足')
      } else {
        item.qty = newQty
      }
    },
    removeItem(idx) {
      this.cart.splice(idx, 1)
    },
    getProductImage(p) {
      // 优先使用数据库中的 image 字段，否则使用 product_{id}.jpg 命名规则
      if (p.image) return '/images/' + p.image
      return '/images/product_' + p.id + '.jpg'
    },
    onImgError(e) {
      e.target.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=A+simple+minimalist+product+icon+on+white+background,+clean+flat+design&image_size=square_hd'
    },
    async submitOrder() {
      if (this.cart.length === 0) return
      if (this.remainAmount > 0) {
        this.$message.warning('支付金额不足，请增加储值支付或积分抵扣')
        return
      }
      try {
        const items = this.cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          pointsRate: item.pointsRate
        }))
        const res = await doConsume({
          items,
          balancePay: this.balancePay,
          pointsPay: this.pointsPay,
          totalAmount: this.totalPrice
        })
        if (res.code === 200) {
          this.$message.success('支付成功！')
          this.cart = []
          this.balancePay = 0
          this.pointsPay = 0
          this.loadUserInfo()
          this.loadProducts()
        } else {
          this.$message.error(res.message || '支付失败')
        }
      } catch (e) {
        this.$message.error('支付失败')
      }
    }
  }
}
</script>

<style scoped>
.shop-layout {
  display: flex;
  gap: 20px;
}

.product-area {
  flex: 1;
}

.cart-area {
  width: 400px;
  flex-shrink: 0;
}

.card {
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #4CAF50;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.product-item {
  border: 1px solid #F0F0F0;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.product-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
  transform: translateY(-1px);
}

.product-img {
  width: 80px;
  height: 80px;
  margin: 0 auto 8px;
  border-radius: 4px;
  overflow: hidden;
  background: #F5F5F5;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: #4CAF50;
}

.product-stock {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.empty, .empty-cart {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
  font-size: 14px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F5;
  gap: 8px;
}

.cart-item-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  min-width: 0;
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
  font-size: 14px;
  font-weight: 600;
  width: 24px;
  text-align: center;
}

.cart-item-price {
  font-size: 13px;
  font-weight: 600;
  color: #4CAF50;
  width: 60px;
  text-align: right;
}

.cart-total {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 2px solid #F0F0F0;
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #303133;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: #4CAF50;
}

.user-info-row {
  font-size: 13px;
  color: #606266;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.balance-highlight {
  font-weight: 600;
  color: #4CAF50;
}

.points-highlight {
  font-weight: 600;
  color: #E6A23C;
}

.points-hint {
  font-size: 11px;
  color: #909399;
}

.divider {
  margin: 0 8px;
  color: #E0E0E0;
}

.pay-field {
  margin-bottom: 12px;
}

.pay-field label {
  display: block;
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.points-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.pay-remain {
  margin: 12px 0;
  font-size: 14px;
  color: #606266;
}

.remain-warn {
  color: #F56C6C;
  font-weight: 600;
}

.pay-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
  margin-top: 8px;
}

.pay-btn:hover {
  background: #2E7D32 !important;
  border-color: #2E7D32 !important;
}

.pay-btn.is-disabled {
  background: #C0C4CC !important;
  border-color: #C0C4CC !important;
}
</style>