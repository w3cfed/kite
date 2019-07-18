const models = require('../../../db/mysqldb/index')
const { sign_resJson, admin_resJson } = require('../../utils/res_data')
const {
  tools: { encrypt }
} = require('../../utils/index')
const config = require('../../config')
const moment = require('moment')
const Op = require('sequelize').Op

function ErrorMessage (message) {
  this.message = message
  this.name = 'UserException'
}

class AdminSystemLog {
  /**
   * 创建后台日志
   * @param   {object} ctx 上下文对象
   */

  static async create_admin_system_log ({ uid, type = 1, content }) {
    return models.admin_system_log.create({
      uid,
      type,
      content
    })
  }

  /**
   * 获取后台系统日志操作
   * @param   {object} ctx 上下文对象
   */
  static async get_admin_system_log_list (ctx) {
    const { page = 1, pageSize = 10 } = ctx.query
    try {
      let { count, rows } = await models.admin_system_log.findAndCountAll({
        where: '', // 为空，获取全部，也可以自己添加条件
        offset: (page - 1) * Number(pageSize), // 开始的数据索引，比如当page=2 时offset=10 ，而pagesize我们定义为10，则现在为索引为10，也就是从第11条开始返回数据条目
        limit: Number(pageSize) // 每页限制返回的数据条数
      })
      for (let i in rows) {
        rows[i].setDataValue(
          'create_at',
          await moment(rows[i].create_date)
            .format('YYYY-MM-DD H:m:s')
            .toLocaleString()
        )
        rows[i].setDataValue(
          'admin_user',
          await models.admin_user.findOne({
            where: { uid: rows[i].uid },
            attributes: ['uid', 'nickname']
          })
        )
      }
      admin_resJson(ctx, {
        state: 'success',
        message: '返回成功',
        data: {
          count: count,
          list: rows
        }
      })
    } catch (err) {
      admin_resJson(ctx, {
        state: 'error',
        message: '错误信息：' + err.message
      })
    }
  }

  /**
   * 删除后台系统日志
   */
  static async delete_admin_system_log (ctx) {
    const { id } = ctx.request.body
    try {
      await models.admin_system_log.destroy({ where: { id } })
      await admin_resJson(ctx, {
        state: 'success',
        message: '删除后台系统日志成功'
      })
    } catch (err) {
      admin_resJson(ctx, {
        state: 'error',
        message: '错误信息：' + err.message
      })
    }
  }
}

module.exports = AdminSystemLog
