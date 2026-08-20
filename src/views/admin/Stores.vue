<template>
  <div class="stores-page">
    <div class="card search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索门店名称/地址" clearable prefix-icon="el-icon-search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="green-btn">搜索</el-button>
        </el-form-item>
        <el-form-item class="right-btn">
          <el-button type="success" @click="handleAdd" class="green-btn">新增门店</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="card table-card">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="门店名称" min-width="140" />
        <el-table-column prop="address" label="地址" min-width="180" />
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '营业' : '歇业' }}
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
      <el-form ref="storeForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="form.manager" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">营业</el-radio>
            <el-radio :label="0">歇业</el-radio>
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
import { getStoreList, addStore, updateStore, delStore } from '@/api'

export default {
  name: 'AdminStores',
  data() {
    return {
      searchForm: { keyword: '' },
      tableData: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      dialogTitle: '新增门店',
      isEdit: false,
      form: {
        id: null,
        name: '',
        address: '',
        manager: '',
        phone: '',
        status: 1
      },
      rules: {
        name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await getStoreList({
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchForm.keyword
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
      this.searchForm.keyword = ''
      this.currentPage = 1
      this.loadData()
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增门店'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑门店'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该门店吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await delStore(row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async submitForm() {
      this.$refs.storeForm.validate(async (valid) => {
        if (!valid) return
        try {
          if (this.isEdit) {
            await updateStore(this.form)
          } else {
            await addStore(this.form)
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
      this.form = { id: null, name: '', address: '', manager: '', phone: '', status: 1 }
      this.$refs.storeForm && this.$refs.storeForm.resetFields()
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

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>