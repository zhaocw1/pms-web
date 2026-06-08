import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listProject(query) {
  return request({
    url: 'manage/project/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getProject(id) {
  return request({
    url: '/manage/project/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addProject(data) {
  return request({
    url: '/manage/project',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateProject(data) {
  return request({
    url: '/manage/project',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delProject(id) {
  return request({
    url: '/manage/project/' + id,
    method: 'delete'
  })
}

export function projectList() {
  return request({
    url: '/manage/project/projectList',
    method: 'get'
  })
}
