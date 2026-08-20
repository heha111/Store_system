<template>
  <div class="dashboard">
    <div class="stat-cards">
      <div class="stat-card" v-for="item in stats" :key="item.title">
        <div class="stat-icon" :style="{ background: item.bg }">
          <i :class="item.icon"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-title">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <div class="charts-row">
      <div class="card chart-card chart-large">
        <div class="card-title">月度营收趋势</div>
        <div ref="revenueChart" class="chart-box"></div>
      </div>
      <div class="card chart-card chart-small">
        <div class="card-title">消费类型占比</div>
        <div ref="pieChart" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getDashboard, getRevenue, getMembers } from '@/api'

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: [
        { title: '总营收', value: '¥0', icon: 'el-icon-money', bg: 'linear-gradient(135deg, #4CAF50, #66BB6A)' },
        { title: '会员总数', value: '0', icon: 'el-icon-user', bg: 'linear-gradient(135deg, #43A047, #81C784)' },
        { title: '储值总额', value: '¥0', icon: 'el-icon-bank-card', bg: 'linear-gradient(135deg, #2E7D32, #4CAF50)' },
        { title: '积分消耗', value: '0', icon: 'el-icon-star-on', bg: 'linear-gradient(135deg, #388E3C, #66BB6A)' }
      ],
      revenueChart: null,
      pieChart: null
    }
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {
    if (this.revenueChart) this.revenueChart.dispose()
    if (this.pieChart) this.pieChart.dispose()
  },
  methods: {
    async loadData() {
      try {
        const res = await getDashboard()
        if (res.code === 200 && res.data) {
          const d = res.data
          this.stats[0].value = '¥' + (d.totalRevenue || 0).toLocaleString()
          this.stats[1].value = (d.totalMembers || 0).toLocaleString()
          this.stats[2].value = '¥' + (d.totalRecharge || 0).toLocaleString()
          this.stats[3].value = (d.totalPointsConsumed || 0).toLocaleString()
        }
      } catch (e) {
        // 加载失败时显示默认数据
      }
      this.$nextTick(() => {
        this.initRevenueChart()
        this.initPieChart()
      })
    },
    initRevenueChart() {
      if (!this.$refs.revenueChart) return
      this.revenueChart = echarts.init(this.$refs.revenueChart)
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: months,
          axisLine: { lineStyle: { color: '#E0E0E0' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: '#F0F0F0' } },
          axisLabel: { color: '#909399' }
        },
        series: [{
          data: new Array(12).fill(0),
          type: 'line',
          smooth: true,
          lineStyle: { color: '#4CAF50', width: 3 },
          itemStyle: { color: '#4CAF50' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(76,175,80,0.3)' },
              { offset: 1, color: 'rgba(76,175,80,0.02)' }
            ])
          }
        }]
      }
      this.revenueChart.setOption(option)
      // 异步加载真实数据
      this.loadRevenueData()
    },
    async loadRevenueData() {
      try {
        const res = await getRevenue()
        if (res.code === 200 && res.data && this.revenueChart) {
          const data = new Array(12).fill(0)
          res.data.forEach(item => {
            const month = parseInt(item.month.split('-')[1]) - 1
            const val = parseFloat(item.revenue) || 0
            data[month] = val
          })
          this.revenueChart.setOption({ series: [{ data }] })
        }
      } catch (e) {
        // 加载失败时保持默认图表
      }
    },
    initPieChart() {
      if (!this.$refs.pieChart) return
      this.pieChart = echarts.init(this.$refs.pieChart)
      const option = {
        tooltip: { trigger: 'item' },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: { color: '#606266' }
        },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: [
            { value: 0, name: '储值消费', itemStyle: { color: '#4CAF50' } },
            { value: 0, name: '积分兑换', itemStyle: { color: '#AED581' } }
          ]
        }]
      }
      this.pieChart.setOption(option)
      // 异步加载真实数据
      this.loadPieData()
    },
    async loadPieData() {
      try {
        const res = await getDashboard()
        if (res.code === 200 && res.data && this.pieChart) {
          const d = res.data
          const consumeAmt = parseFloat(d.totalRevenue) || 0
          const exchangePts = parseFloat(d.totalPointsConsumed) || 0
          this.pieChart.setOption({
            series: [{
              data: [
                { value: consumeAmt, name: '储值消费', itemStyle: { color: '#4CAF50' } },
                { value: exchangePts, name: '积分消耗', itemStyle: { color: '#AED581' } }
              ]
            }]
          })
        }
      } catch (e) {
        // 加载失败时保持默认图表
      }
    }
  }
}
</script>

<style scoped>
.stat-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 24px;
  color: #FFFFFF;
}

.stat-info {
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 13px;
  color: #909399;
}

.charts-row {
  display: flex;
  gap: 20px;
}

.chart-card {
  background: #FFFFFF;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.chart-large {
  flex: 2;
}

.chart-small {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #4CAF50;
}

.chart-box {
  width: 100%;
  height: 320px;
}
</style>