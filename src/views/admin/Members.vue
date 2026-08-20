<template>
  <div class="members-page">
    <div class="card search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索用户名/手机号" clearable prefix-icon="el-icon-search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="green-btn">搜索</el-button>
        </el-form-item>
        <el-form-item class="right-btn">
          <el-button type="success" @click="handleAdd" class="green-btn">新增会员</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="card table-card">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="balance" label="储值余额" width="110">
          <template slot-scope="scope">
            <span class="money">¥{{ scope.row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" />
        <el-table-column prop="createTime" label="注册时间" width="160" />
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="460px" @close="resetForm">
      <el-form ref="memberForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" />
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
import { getList, delUser, adminUpdateUser } from '@/api'

export default {
  name: 'Members',
  data() {
    return {
      searchForm: { keyword: '' },
      tableData: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      dialogTitle: '新增会员',
      isEdit: false,
      form: {
        id: null,
        username: '',
        nickname: '',
        phone: '',
        password: '',
        balance: 0,
        points: 0,
        status: 1
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 6 }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await getList({
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
      this.dialogTitle = '新增会员'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑会员'
      this.form = { ...row, password: '' }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该会员吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await delUser(row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async submitForm() {
      this.$refs.memberForm.validate(async (valid) => {
        if (!valid) return
        try {
          if (this.isEdit) {
            await adminUpdateUser(this.form)
          }
          this.$message.success(this.isEdit ? '修改成功' : '新增暂不支持，请通过注册功能添加')
          this.dialogVisible = false
          this.loadData()
        } catch (e) {
          this.$message.error('操作失败')
        }
      })
    },
    resetForm() {
      this.form = { id: null, username: '', nickname: '', phone: '', password: '' }
      this.$refs.memberForm && this.$refs.memberForm.resetFields()
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
</style>