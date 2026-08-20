<template>
  <div class="recharges-page">
    <!-- 充值总额统计卡片 -->
    <div class="summary-card card">
      <div class="summary-label">充值总额</div>
      <div class="summary-value">¥{{ totalAmount.toLocaleString() }}</div>
    </div>

    <!-- 搜索栏 -->
    <div class="card search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="充值单号">
          <el-input
            v-model="searchForm.rechargeNo"
            placeholder="输入充值单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="用户">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/昵称/手机号"
            clearable
            prefix-icon="el-icon-search"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="green-btn">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="card table-card">
      <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="rechargeNo" label="充值单号" min-width="180" />
        <el-table-column label="用户" min-width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.nickname || scope.row.username }}</div>
            <div class="sub-info">{{ scope.row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template slot-scope="scope">
            <span class="money">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="100">
          <template slot-scope="scope">
            <el-tag size="small" :type="payMethodType(scope.row.payMethod)">
              {{ payMethodLabel(scope.row.payMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已到账' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="充值时间" min-width="160" />
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @current-change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getRechargeList } from '@/api'

export default {
  name: 'Recharges',
  data() {
    return {
      searchForm: {
        keyword: '',
        rechargeNo: '',
        dateRange: []
      },
      tableData: [],
      total: 0,
      totalAmount: 0,
      pageSize: 10,
      currentPage: 1,
      loading: false
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchForm.keyword || undefined,
          rechargeNo: this.searchForm.rechargeNo || undefined
        }
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
        }
        const res = await getRechargeList(params)
        if (res.code === 200 && res.data) {
          this.tableData = res.data.records || []
          this.total = res.data.total || 0
          this.totalAmount = res.data.totalAmount || 0
        }
      } catch (e) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    payMethodLabel(method) {
      const map = { 1: '微信', 2: '支付宝', 3: '现金' }
      return map[method] || '未知'
    },
    payMethodType(method) {
      const map = { 1: 'success', 2: 'primary', 3: 'warning' }
      return map[method] || 'info'
    },
    handleSearch() {
      this.currentPage = 1
      this.loadData()
    },
    handleReset() {
      this.searchForm = { keyword: '', rechargeNo: '', dateRange: [] }
      this.currentPage = 1
      this.loadData()
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

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-label {
  font-size: 14px;
  color: #909399;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #4CAF50;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.green-btn {
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
}
.green-btn:hover {
  background: #2E7D32 !important;
  border-color: #2E7D32 !important;
}

.money {
  color: #4CAF50;
  font-weight: 600;
}

.sub-info {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>