<template>
  <div class="user-stores">
    <div class="card">
      <div class="card-title">附近门店</div>
      <div class="store-grid" v-if="stores.length > 0">
        <div class="store-card" v-for="store in stores" :key="store.id">
          <div class="store-icon">
            <i class="el-icon-office-building"></i>
          </div>
          <div class="store-name">{{ store.name }}</div>
          <div class="store-address">
            <i class="el-icon-location-outline"></i>
            {{ store.address }}
          </div>
          <div class="store-phone">
            <i class="el-icon-phone-outline"></i>
            {{ store.phone }}
          </div>
          <div class="store-manager">
            <i class="el-icon-user"></i>
            {{ store.manager }}
          </div>
          <el-tag size="small" :type="store.status === 1 ? 'success' : 'info'">
            {{ store.status === 1 ? '营业中' : '已歇业' }}
          </el-tag>
        </div>
      </div>
      <div v-else class="empty-stores">暂无门店信息</div>
    </div>
  </div>
</template>

<script>
import { getActiveStores } from '@/api'

export default {
  name: 'UserStores',
  data() {
    return {
      stores: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await getActiveStores()
        if (res.code === 200) {
          this.stores = res.data || []
        }
      } catch (e) {
        // 如果接口不可用，尝试获取所有门店
        try {
          const { getStoreList } = await import('@/api')
          const res = await getStoreList({ page: 1, pageSize: 50 })
          if (res.code === 200) {
            this.stores = (res.data.records || res.data.list || []).filter(s => s.status === 1)
          }
        } catch (e2) {
          // 静默处理
        }
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

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.store-card {
  background: #FAFFFA;
  border: 1px solid #E8F5E9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;
}

.store-card:hover {
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.12);
}

.store-icon {
  width: 52px;
  height: 52px;
  background: #F0F9EB;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.store-icon i {
  font-size: 24px;
  color: #4CAF50;
}

.store-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.store-address,
.store-phone,
.store-manager {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.store-address i,
.store-phone i,
.store-manager i {
  color: #4CAF50;
  font-size: 14px;
}

.empty-stores {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>