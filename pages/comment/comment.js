// 获取数据库
const db = wx.cloud.database()
// 获取集合
const comment_col = db.collection('comment')

Page({
  data: {
    commentText:'',
    commentScore:''
  },

  onLoad(){

  },

  onScoreChange(event){
    this.setData({
      commentScore: event.detail
    })
  },

  onTextChange(event){
    this.setData({
      commentText: event.detail
    })
  },
  
  Submit(){
    const { commentScore, commentText } = this.data
    comment_col.add({
      data: {
        score: commentScore,
        text: commentText
      },
      success: function(res) {
        console.log('评论成功', res)
      },
      fail: function(res) {
        console.error('评论失败', res)
      }
    })
  }

})