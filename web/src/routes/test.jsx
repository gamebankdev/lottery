import React from "react";

import Styles from "../style/test.less";
import { Tabs, Input } from "antd";
import Lottery from "../routes/lottery.jsx";
import InternalTest from "../routes/InternalTest.jsx";
import gamebank from '../util/gamebank'
const TabPane = Tabs.TabPane;
function callback(key) {
 
}
class Test extends React.Component {
  state={
    userName:'',
    password:'',
    priKey:"",
  }
  Transformation=(e)=>{
   if (gamebank.auth.isWif(e.target.value)){
    this.setState({
      password:e.target.value,
      priKey:e.target.value,
    })
   }else{
    const pri=gamebank.auth.toWif(this.state.userName, e.target.value, "active")
    this.setState({
      password:e.target.value,
      priKey:pri
    })
   }
  }
  render() {
    const {priKey,password,userName}=this.state
    return (
      <div className={Styles.container}>
        <h1>合约测试</h1>
        <div style={{padding:"20px 0"}}>
          <Input
            className={Styles.buyNum}
            value={userName}
            onChange={e => this.setState({userName:e.target.value})}
            placeholder="账号"
            type="text"
          />
          <Input
            onChange={this.Transformation}
            value={password}
            className={Styles.buyNum}
            placeholder="密码"
            type="password"
          />
        </div>
        <Tabs defaultActiveKey="1" onChange={callback}>
          <TabPane tab="彩票" key="1">
            <Lottery {...{priKey,userName}} />
          </TabPane>
          <TabPane tab="合约" key="2">
            <InternalTest {...{priKey,userName}} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default Test;
