<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="项目名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="请输入客户名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="项目负责人" prop="directorName">
        <el-input
          v-model="queryParams.directorName"
          placeholder="请输入项目负责人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户对接人" prop="headName">
        <el-input
          v-model="queryParams.headName"
          placeholder="请输入客户对接人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['manage:project:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:project:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:project:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="projectList"
              ref="projectTable"
              @selection-change="handleSelectionChange"
              @filter-change="filterChanged"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="项目名称" align="center">
        <template slot-scope="scope">
          <el-link @click="openProjectDes(scope.row)" class="link-type" style="color: #0381bb">
            {{ scope.row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" prop="companyName"/>
      <el-table-column label="项目类型" align="center" prop="projectType"
                       :filter-multiple="false"
                       :filters="[{ text: '内部研发', value: 1 }, { text: '定制开发', value: 2 }, { text: '产品实施', value: 3 }]"
                       :column-key="columnKey[0]"
      >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.project_type" :value="scope.row.projectType"/>
        </template>
      </el-table-column>
      <el-table-column label="管理标准" align="center" prop="manageStandard"
                       :filter-multiple="false"
                       :filters="[{ text: 'L1', value: 1 }, { text: 'L2', value: 2 }, { text: 'L3', value: 3 }, { text: 'L4', value: 4 }]"
                       :column-key="columnKey[1]"
      >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.manage_standard" :value="scope.row.manageStandard"/>
        </template>
      </el-table-column>
      <el-table-column label="项目状态" align="center" prop="status"
                       :filter-multiple="false"
                       :filters="[{ text: '进行中', value: 0 }, { text: '运维期', value: 1 }]"
                       :column-key="columnKey[2]"
      >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.project_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="项目负责人" align="center" prop="directorName"/>
      <el-table-column label="客户对接人" align="center" prop="headName"/>
      <el-table-column label="项目金额" align="center" prop="amount"/>
      <el-table-column label="项目成本" align="center" prop="cost"/>
      <el-table-column label="盈亏" align="center" prop="isProfit"
                       :filter-multiple="false"
                       :filters="[{ text: '盈利', value: '1' }, { text: '亏损', value: '2' },{ text: '持平', value: '0' }]"
                       :column-key="columnKey[3]"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.amount > scope.row.cost" style="color: #10f309">
            {{ '盈利' }} <img class="pic-up__parent" src="@/assets/images/up.png"
                              alt="up" width="15"
          ></div>
          <div v-if="scope.row.amount < scope.row.cost" style="color: #ff0008">
            {{ '亏损' }} <img class="pic-down__parent"
                              src="@/assets/images/down.png" alt="down" width="15"
          >
          </div>
          <div v-if="scope.row.amount === scope.row.cost" style="color: #0c0001">
            {{ '持平' }} <img class="pic-flat__parent"
                              src="@/assets/images/flat.png" alt="flat" width="15"
          >
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="openFileDialog(scope.row)"
          >文档
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="goToMilestone(scope.row)"
          >里程碑
          </el-button>
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)"
                       v-hasPermi="['manage:project:edit', 'manage:project:remove']"
          >
            <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="handleUpdate" icon="el-icon-edit"
                                v-hasPermi="['manage:project:edit']"
              >修改
              </el-dropdown-item>
              <el-dropdown-item command="handleDelete" icon="el-icon-delete"
                                v-hasPermi="['manage:project:remove']"
              >删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" :disabled="isDisable">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" style="width:600px"/>
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" style="width:600px"/>
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="form.projectType" clearable placeholder="请选择项目类型" style="width:600px">
            <el-option
              v-for="dict in dict.type.project_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="管理标准" prop="manageStandard">
          <el-select v-model="form.manageStandard" clearable placeholder="请输入管理标准" style="width:600px">
            <el-option
              v-for="dict in dict.type.manage_standard"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" clearable placeholder="项目状态" style="width:600px">
            <el-option
              v-for="dict in dict.type.project_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目负责人" prop="directorName">
          <el-input v-model="form.directorName" placeholder="请输入项目负责人" style="width:600px"/>
        </el-form-item>
        <el-form-item label="客户对接人" prop="headName">
          <el-input v-model="form.headName" placeholder="请输入客户对接人" style="width:600px"/>
        </el-form-item>
        <el-form-item label="项目简介" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" style="width:600px"/>
        </el-form-item>
        <el-form-item label="评价" prop="des">
          <el-input v-model="form.des" type="textarea" placeholder="请输入内容" style="width:600px"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-if="title !== '【项目详情】'">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文档对话框 -->
    <el-dialog :title="title" :visible.sync="openDes" width="1200px" class="style" append-to-body>
      <template>
        <div class="app-container">
          <el-form :model="fileQueryParams" ref="fileQueryForm" size="small" :inline="true" v-show="showFileSearch"
                   label-width="90px"
          >
            <el-form-item label="项目名称" prop="projectId">
              <el-select v-model="fileQueryParams.projectId" clearable disabled placeholder="请选择项目名称">
                <el-option
                  v-for="item in projectOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="里程碑名称" prop="milestoneId">
              <el-select v-model="fileQueryParams.milestoneId" clearable placeholder="请选择里程碑名称">
                <el-option
                  v-for="item in milestoneOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="文件名称" prop="name">
              <el-input
                v-model="fileQueryParams.name"
                placeholder="请输入文件名称"
                clearable
                @keyup.enter.native="handleFileQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleFileQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetFileQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="info"
                plain
                icon="el-icon-upload2"
                size="mini"
                @click="handleImport"
              >上传文档
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleFileDelete"
                v-hasPermi="['manage:file:remove']"
              >批量删除
              </el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showFileSearch" @queryTable="getFileList"></right-toolbar>
          </el-row>
          <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="文件名称" align="center" prop="name">
              <template slot-scope="scope">
                <el-link @click="downloadFile(scope.row)" class="link-type" style="color: #00afff">
                  {{ scope.row.name }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="项目名称" align="center" prop="projectName"/>
            <el-table-column label="里程碑名称" align="center" prop="milestoneName"/>
            <el-table-column label="上传日期" align="center" prop="createTime"/>
            <el-table-column label="文档类型" align="center" prop="fileType">
              <template slot-scope="scope">
                <dict-tag :options="dict.type.file_type" :value="scope.row.fileType"/>
              </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="des"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleFileUpdate(scope.row)"
                  v-hasPermi="['manage:file:edit']"
                >替换
                </el-button>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleFileDelete(scope.row)"
                  v-hasPermi="['manage:file:remove']"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="fileTotal>0"
            :total="fileTotal"
            :page.sync="fileQueryParams.pageNum"
            :limit.sync="fileQueryParams.pageSize"
            @pagination="getFileList"
          />
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="500px" style="height: 700px" append-to-body>
      <el-form ref="fileForm" :model="fileForm" :rules="upload.rules" label-width="80px">
        <el-form-item>
          <el-upload
            ref="upload"
            :limit="1"
            accept=".xlsx, .xls,.png,.jpg,.doc,.docx,.txt"
            :headers="upload.headers"
            :action="upload.url"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            :data="fileForm"
            drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <span>仅允许导入xls,xlsx,jpg,png,doc,docx,txt格式文件。</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件类型" prop="fileType">
          <el-select v-model="fileForm.fileType" clearable placeholder="请选择文件类型" style="width: 380px">
            <el-option
              v-for="dict in dict.type.file_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件备注" prop="des">
          <el-input v-model="fileForm.des" placeholder="文件备注" type="textarea" style="width: 380px"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addProject, delProject, getProject, listProject, projectList, updateProject } from '@/api/manage/project'
import { delFile, download, fileListByProjectId, getFile, listFile } from '@/api/manage/file'
import { getToken } from '@/utils/auth'
import { milestoneListByProjectId } from '@/api/manage/milestone'

export default {
  name: 'Project',
  dicts: ['project_type', 'project_status', 'manage_standard', 'file_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 显示文档搜索条件
      showFileSearch: true,
      // 总条数
      total: 0,
      // 文档总条数
      fileTotal: 0,
      // 【项目】表格数据
      projectList: [],
      // 文档选择项目列表
      projectOptions: [],
      // 里程碑选择项目列表
      milestoneOptions: [],
      // 【文档】表格数据
      fileList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示文档弹出层
      openDes: false,
      // 文本框
      textarea: '',
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/manage/file/upload',
        // 表单校验
        rules: {
          fileType: [
            { required: true, message: '文件类型不能为空', trigger: 'change' }
          ]
        }
      },
      // 查询参数
      fileQueryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        filePath: null,
        fileType: null,
        projectId: null,
        milestoneId: null,
        projectName: null,
        milestoneName: null,
        des: null,
        isDelete: null
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        companyName: null,
        projectType: null,
        manageStandard: null,
        status: null,
        directorName: null,
        headName: null,
        description: null,
        des: null,
        isProfit: null,
        isDelete: 0
      },
      // 表单参数
      form: {},
      // 表单参数
      fileForm: {},
      //是否禁用参数
      isDisable: false,
      // 表单校验
      rules: {
        name: [
          { required: true, message: '项目名称不能为空', trigger: 'blur' }
        ],
        companyName: [
          { required: true, message: '公司名称不能为空', trigger: 'blur' }
        ],
        projectType: [
          { required: true, message: '项目类型不能为空', trigger: 'change' }
        ]
      },
      //表头筛选
      columnKey: ['projectType', 'manageStandard', 'status', 'isProfit']
    }
  },
  created() {
    this.getList()
    this.getProjectList()
  },
  methods: {
    /** 获取项目列表 */
    getProjectList() {
      projectList().then(response => {
        this.projectOptions = response.data
      })
    },
    /** 修改按钮操作 */
    openProjectDes(row) {
      this.reset()
      const id = row.id || this.ids
      getProject(id).then(response => {
        this.form = response.data
        this.open = true
        this.isDisable = true
        this.title = '【项目详情】'
      })
    },

    /** 打开文件对话框 */
    openFileDialog(row) {
      this.resetFile()
      const id = row.id
      milestoneListByProjectId(id).then(response => {
        this.milestoneOptions = response.rows
      })
      fileListByProjectId(id).then(response => {
        this.fileList = response.rows
        this.fileTotal = response.total
        this.title = '【文档上传】'
        this.fileForm.projectName = row.name
        this.fileForm.projectId = row.id
        console.log(this.fileForm)
        this.fileQueryParams.projectId = row.id
        this.openDes = true
      })
    },

    /** 查询【请填写功能名称】列表 */
    getFileList() {
      this.loading = true
      listFile(this.fileQueryParams).then(response => {
        this.fileList = response.rows
        this.fileTotal = response.total
        this.loading = false
      })
    },

    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true
      listProject(this.queryParams).then(response => {
        this.projectList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.isDisable = false
      this.reset()
    },
    // 取消按钮
    cancelDes() {
      this.openDes = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        companyName: null,
        projectType: null,
        manageStandard: null,
        status: null,
        directorName: null,
        headName: null,
        description: null,
        amount: null,
        cost: null,
        des: null,
        isDelete: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('form')
    },

    // 表单重置
    resetFile() {
      this.fileForm = {
        id: null,
        name: null,
        filePath: null,
        fileType: null,
        projectId: null,
        milestoneId: null,
        projectName: null,
        milestoneName: null,
        des: null,
        isDelete: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('fileForm')
    },

    /** 里程碑过滤器  */
    filterChanged(filters) {
      for (const key in filters) {
        if (key === 'projectType') {
          this.queryParams.projectType = filters['projectType'][0]
        }
        if (key === 'manageStandard') {
          this.queryParams.manageStandard = filters['manageStandard'][0]
        }
        if (key === 'status') {
          this.queryParams.status = filters['status'][0]
        }
        if (key === 'isProfit') {
          this.queryParams.isProfit = filters['isProfit'][0]
        }
      }
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 搜索按钮操作 */
    handleFileQuery() {
      this.fileQueryParams.pageNum = 1
      this.getFileList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.projectTable.clearFilter()
      this.resetForm('queryForm')
      this.queryParams.projectType = null
      this.queryParams.manageStandard = null
      this.queryParams.status = null
      this.queryParams.isProfit = null
      this.handleQuery()
    },

    /** 重置按钮操作 */
    resetFileQuery() {
      this.resetForm('fileQueryForm')
      this.handleFileQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.isDisable = false
      this.reset()
      this.open = true
      this.title = '【新增项目】'
    },

    /** 跳转到里程碑页面 */
    goToMilestone(row) {
      this.$router.push({
        path: '/manage/milestone',
        query: {
          projectId: row.id
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isDisable = false
      this.reset()
      const id = row.id || this.ids
      getProject(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改【请填写功能名称】'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateProject(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addProject(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除该项目？').then(function() {
        return delProject(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },

    /** 删除文件 */
    handleFileDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除该文件？').then(function() {
        return delFile(ids)
      }).then(() => {
        this.getFileList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },

    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleUpdate':
          this.handleUpdate(row)
          break
        case 'handleDelete':
          this.handleDelete(row)
          break
        default:
          break
      }
    },
    handleFileUpdate(row) {
      this.resetFile()
      const id = row.id
      getFile(id).then(response => {
        this.fileForm = response.data
        this.upload.open = true
        this.upload.title = '文件替换'
      })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.fileForm.id = null
      this.fileForm.fileType = null
      this.fileForm.des = null
      this.upload.title = '用户导入'
      this.upload.open = true
      this.$nextTick(()=>{
        this.$refs.upload.clearFiles()
      })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.getFileList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs['fileForm'].validate(valid => {
        if (valid) {
          this.$refs.upload.submit()
        }
      })
    },

    //下载文件
    downloadFile(row) {
      console.log(row.name)
      download(row.id).then(response => {
        const blob = new Blob([response])
        let objectUrl = window.URL.createObjectURL(blob) // 创建URL
        console.log(objectUrl)
        let link = document.createElement('a')
        link.href = objectUrl
        link.download = row.projectName + '_' + row.name // 自定义文件名
        link.click() // 下载文件
      })
    }
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  height: 84vh;
  overflow: auto;
}
</style>
