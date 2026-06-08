<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="文件名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="里程碑名称" prop="milestoneName">
        <el-input
          v-model="queryParams.milestoneName"
          placeholder="请输入里程碑名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文件名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入文件名称"
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
          v-hasPermi="['manage:file:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:file:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:file:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件名称" align="center" prop="name" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="里程碑名称" align="center" prop="milestoneName" />
      <el-table-column label="上传日期" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:file:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:file:remove']"
          >删除</el-button>
          <el-button
            type="text"
            icon="el-icon-download"
            size="mini"
            @click="handleExport(scope.row)"
            v-hasPermi="['manage:milestone:export']"
          >导出
          </el-button>
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
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件名字" prop="name">
          <el-input v-model="form.name" placeholder="请输入文件名字" />
        </el-form-item>
        <el-form-item label="文件路径" prop="filePath">
          <el-input v-model="form.filePath" placeholder="请输入文件路径" />
        </el-form-item>
        <el-form-item label="项目id" prop="projectId">
          <el-input v-model="form.projectId" placeholder="请输入项目id" />
        </el-form-item>
        <el-form-item label="里程碑id" prop="milestoneId">
          <el-input v-model="form.milestoneId" placeholder="请输入里程碑id" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="里程碑名称" prop="milestoneName">
          <el-input v-model="form.milestoneName" placeholder="请输入里程碑名称" />
        </el-form-item>
        <el-form-item label="文件备注" prop="des">
          <el-input v-model="form.des" placeholder="请输入文件备注" />
        </el-form-item>
        <el-form-item label="是否删除" prop="isDelete">
          <el-input v-model="form.isDelete" placeholder="请输入是否删除" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<!--<template>-->
<!--  <div>-->
<!--    <el-table-->
<!--      :data="tableData"-->
<!--      :row-class-name="tableRowClassName"-->
<!--      @row-click="handleRowClick">-->
<!--      <el-table-column-->
<!--        label="项目名称"-->
<!--        align="center"-->
<!--        prop="name"-->
<!--        :show-overflow-tooltip="true">-->
<!--        <template slot-scope="scope">-->
<!--          <div-->
<!--            class="highlight-cell"-->
<!--            @click="openFileDialog(scope.row.projectId)">-->
<!--            {{ scope.row.name }}-->
<!--          </div>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      &lt;!&ndash; 其他列... &ndash;&gt;-->
<!--    </el-table>-->

<!--    &lt;!&ndash; 文件上传的对话框组件 &ndash;&gt;-->
<!--    <el-dialog-->
<!--      title="文件上传"-->
<!--      :visible.sync="dialogVisible"-->
<!--      width="30%"-->
<!--    >-->
<!--      <el-upload-->
<!--        class="upload-demo"-->
<!--        action="你的上传地址"-->
<!--        :on-success="handleUploadSuccess"-->
<!--        :before-upload="beforeUpload">-->
<!--        <el-button slot="trigger" size="small" type="primary">选择文件</el-button>-->
<!--        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
<!--      </el-upload>-->
<!--      <span slot="footer" class="dialog-footer">-->
<!--        <el-button @click="dialogVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="submitUpload">确 定</el-button>-->
<!--      </span>-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<script>
import {listFile, getFile, delFile, addFile, updateFile} from "@/api/manage/file";

export default {
  name: "File",
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
      // 总条数
      total: 0,
      // 【请填写功能名称】表格数据
      fileList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        filePath: null,
        projectId: null,
        milestoneId: null,
        projectName: null,
        milestoneName: null,
        des: null,
        isDelete: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          {required: true, message: "文件名字不能为空", trigger: "blur"}
        ],
        projectId: [
          {required: true, message: "项目id不能为空", trigger: "blur"}
        ],
        milestoneId: [
          {required: true, message: "里程碑id不能为空", trigger: "blur"}
        ],
      },
      tableData: [
        // 你的表格数据，确保每个对象都有 projectId 和 name 属性
      ],
      dialogVisible: false,
      uploadFiles: [], // 用于存储待上传的文件
    };
  },
  created() {
    this.getList();
  },
  methods: {

    tableRowClassName({ row, rowIndex }) {
      // 根据需要返回行高亮的 CSS 类名，这里不做高亮处理
      return '';
    },
    handleRowClick(row) {
      // 如果需要在整行点击时做其他处理，可以在这里添加代码
    },
    openFileDialog(projectId) {
      // 打开文件上传对话框，并存储当前点击的行的 projectId
      this.currentProjectId = projectId; // 假设你有一个 data 属性 currentProjectId
      this.dialogVisible = true;
    },
    handleUploadSuccess(response, file, fileList) {
      // 处理文件上传成功的逻辑
      console.log('上传成功:', response);
      // 可以在这里清空 uploadFiles 数组或做其他处理
    },
    beforeUpload(file) {
      // 在上传之前检查文件类型和大小等
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 0.5;

      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 500KB!');
      }
      return isJPG || isPNG && isLt2M;
    },
    submitUpload() {
      // 提交上传的文件，这里假设你已经在 beforeUpload 中筛选了文件
      // 并且 uploadFiles 数组中存储了所有待上传的文件
      // 实际上，你可能需要在 el-upload 的 action 属性中处理上传逻辑，
      // 或者使用其他方式（如 FormData 和 axios）来上传文件。
      // 这里只是一个示例，所以 submitUpload 方法是空的。
      // 你需要根据你的后端 API 来实现文件上传的逻辑。
      this.dialogVisible = false; // 提交后关闭对话框
    },
  // 确保在 data 中添加 currentProjectId 属性（如果需要在其他地方使用）
  // data() {
  //   return {
  //     // ...其他属性
  //     currentProjectId: null, // 用于存储当前点击的行的 projectId
  //   };
  // },
  // 但由于我们直接在 openFileDialog 方法中使用了 projectId，并且没有在模板中引用 currentProjectId，
  // 所以你可以选择在 openFileDialog 方法内部使用局部变量而不是 data 属性来存储 projectId。


    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      listFile(this.queryParams).then(response => {
        this.fileList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        filePath: null,
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
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加【请填写功能名称】";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getFile(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改【请填写功能名称】";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateFile(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addFile(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项？').then(function () {
        return delFile(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('manage/file/export', {
        ...this.queryParams
      }, `file_${new Date().getTime()}.xlsx`)
    },
    uploadFile() {
      var formData = new FormData(document.getElementById('uploadForm'));
      fetch('/file/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          document.getElementById('uploadResult').innerText = JSON.stringify(data);
        });
    },
    downloadFile() {
      var fileName = document.getElementById('fileName').value;
      window.location.href = '/file/download/' + encodeURIComponent(fileName);
    }
  }
};

</script>
