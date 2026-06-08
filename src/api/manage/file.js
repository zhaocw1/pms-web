import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listFile(query) {
  return request({
    url: '/manage/file/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getFile(id) {
  return request({
    url: '/manage/file/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addFile(data) {
  return request({
    url: '/manage/file',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateFile(data) {
  return request({
    url: '/manage/file',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delFile(id) {
  return request({
    url: '/manage/file/' + id,
    method: 'delete'
  })
}


// 通过projectId查询文档列表
export function fileListByProjectId(data) {
  return request({
    url: '/manage/file/listByProjectId?projectId=' + data,
    method: 'post',
    data: data
  })
}

// 上传文件
export function upload(data) {
  return request({
    url: '/manage/file/upload',
    method: 'post',
    data: data
  })
}
// 上传文件
export function download(fileId) {
  return request({
    url: '/manage/file/download/'+fileId,
    method: 'get',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    responseType: 'blob',
  })
}
