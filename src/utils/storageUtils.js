//进行local数据存储管理的工具模块
import store from 'store'

const User_Key = 'user_key'

const storageUtils = {

    //保存
    saveUser(user) {
        store.set(User_Key, user);
    },

    //获取
    getUser() {
        //如果为空就返回一个空对象
        return store.get(User_Key) || {}
    },

    //删除
    removeUser() {
        store.remove(User_Key)
    }
}
export default storageUtils