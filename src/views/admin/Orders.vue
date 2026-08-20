<template>
  <div class="orders-page">
    <div class="card table-card">
      <el-table :data="tableData" stripe style="width: 100%" @row-click="handleRowClick">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="用户" width="100">
          <template slot-scope="scope">
            {{ scope.row.nickname || scope.row.username }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.type === 'exchange' ? 'warning' : 'success'">
              {{ scope.row.type === 'exchange' ? '兑换' : '消费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总金额" width="100">
          <template slot-scope="scope">
            <span class="money">¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="储值抵扣" width="100">
          <template slot-scope="scope">
            <span class="money">¥{{ scope.row.balancePay || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="积分抵扣" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.pointsPay || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="获得积分" width="100">
          <template slot-scope="scope">
            <span class="points">{{ scope.row.gainedPoints || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" min-width="160" />
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

    <el-dialog title="订单详情" :visible.sync="detailVisible" width="500px">
      <div class="detail-box" v-if="currentDetail">
        <div class="detail-row">
          <span class="detail-label">订单号：</span><span>{{ currentDetail.orderNo }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">用户：</span><span>{{ currentDetail.nickname || currentDetail.username }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">类型：</span>
          <el-tag size="small" :type="currentDetail.type === 'exchange' ? 'warning' : 'success'">
            {{ currentDetail.type === 'exchange' ? '兑换' : '消费' }}
          </el-tag>
        </div>
        <el-table :data="detailItems" stripe style="margin-top: 12px">
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="quantity" label="数量" width="60" />
          <el-table-column label="小计" width="80">
            <template slot-scope="scope">
              ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        <div class="detail-summary">
          <div class="detail-row"><span class="detail-label">总金额：</span><span class="money">¥{{ currentDetail.totalAmount }}</span></div>
          <div class="detail-row"><span class="detail-label">储值支付：</span><span class="money">¥{{ currentDetail.balancePay || 0 }}</span></div>
          <div class="detail-row"><span class="detail-label">积分抵扣：</span><span>{{ currentDetail.pointsPay || 0 }}积分</span></div>
          <div class="detail-row"><span class="detail-label">获得积分：</span><span class="points">{{ currentDetail.gainedPoints || 0 }}</span></div>
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" class="green-btn" @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getConsumeList, getConsumeDetail } from '@/api'

export default {
  name: 'Orders',
  data() {
    return {
      tableData: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      detailVisible: false,
      currentDetail: null,
      detailItems: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await getConsumeList({
          page: this.currentPage,
          pageSize: this.pageSize
        })
        if (res.code === 200 && res.data) {
          this.tableData = res.data.records || res.data.list || []
          this.total = res.data.total || 0
        }
      } catch (e) {
        this.$message.error('加载数据失败')
      }
    },
    async handleRowClick(row) {
      try {
        const res = await getConsumeDetail(row.id)
        if (res.code === 200) {
          this.currentDetail = res.data
          this.detailItems = res.data.items || []
          this.detailVisible = true
        }
      } catch (e) {
        this.$message.error('获取订单详情失败')
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

.money {
  color: #4CAF50;
  font-weight: 600;
}

.points {
  color: #E6A23C;
  font-weight: 600;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.green-btn {
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
}

.detail-box {
  font-size: 14px;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.detail-label {
  color: #909399;
  width: 80px;
}

.detail-summary {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E0E0E0;
}
</style>