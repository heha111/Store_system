<template>
  <div class="products-page">
    <div class="card search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索商品名称" clearable prefix-icon="el-icon-search" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.type" placeholder="商品类型" clearable>
            <el-option label="商品" :value="1" />
            <el-option label="礼品" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="green-btn">搜索</el-button>
        </el-form-item>
        <el-form-item class="right-btn">
          <el-button type="success" @click="handleAdd" class="green-btn">新增商品</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="card table-card">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="图片" width="70">
          <template slot-scope="scope">
            <img :src="getProductImage(scope.row)" class="table-img" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column label="类型" width="80">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.type === 2 ? 'warning' : 'success'">
              {{ scope.row.type === 2 ? '礼品' : '商品' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            <span class="money">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="pointsRate" label="积分倍率" width="90" />
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #F56C6C" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px" @close="resetForm">
      <el-form ref="productForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="form.price" type="number" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model.number="form.stock" type="number" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="商品" :value="1" />
            <el-option label="礼品" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分倍率" prop="pointsRate">
          <el-input v-model.number="form.pointsRate" type="number" placeholder="每消费1元获得的积分" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-input v-model="form.image" placeholder="图片文件名，如 product_1.jpg，放在 public/images/ 下" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="green-btn" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProductList, addProduct, updateProduct, delProduct } from '@/api'

export default {
  name: 'Products',
  data() {
    return {
      searchForm: { keyword: '', type: null },
      tableData: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      dialogTitle: '新增商品',
      isEdit: false,
      form: {
        id: null,
        name: '',
        price: 0,
        stock: 0,
        type: 1,
        pointsRate: 1,
        status: 1,
        image: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
        stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await getProductList({
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchForm.keyword,
          type: this.searchForm.type
        })
        if (res.code === 200 && res.data) {
          this.tableData = res.data.records || res.data.list || []
          this.total = res.data.total || 0
        }
      } catch (e) {
        this.$message.error('加载数据失败')
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.loadData()
    },
    handleReset() {
      this.searchForm = { keyword: '', type: null }
      this.currentPage = 1
      this.loadData()
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增商品'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑商品'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await delProduct(row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    getProductImage(p) {
      if (p.image) return '/images/' + p.image
      return '/images/product_' + p.id + '.jpg'
    },
    async submitForm() {
      this.$refs.productForm.validate(async (valid) => {
        if (!valid) return
        try {
          if (this.isEdit) {
            await updateProduct(this.form)
          } else {
            await addProduct(this.form)
          }
          this.$message.success(this.isEdit ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.loadData()
        } catch (e) {
          this.$message.error('操作失败')
        }
      })
    },
    resetForm() {
      this.form = { id: null, name: '', price: 0, stock: 0, type: 1, pointsRate: 1, status: 1, image: '' }
      this.$refs.productForm && this.$refs.productForm.resetFields()
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

.search-form {
  display: flex;
  align-items: center;
}

.right-btn {
  margin-left: auto;
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

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.table-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #F0F0F0;
}
</style>