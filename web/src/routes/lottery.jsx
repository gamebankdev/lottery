import React, { Component } from "react";
import { getData, postData,  } from "../util/fetchUrl";
import FormatTime from "./formatTime";
import { myserver } from "../../config";
import Styles from "../style/lottery.less";
import { Input, InputNumber,Button } from "antd";
import gamebank from "../util/gamebank";
/**
 * Openingtime Date 开奖时间,
 * AmountOfBets number 奖池,
 * currentHeadBlocNumber number 购买人数,
 * CurrentPeriod 当前期数
 *
 * lotteryNumber string 要购买的彩票号码
 * amount number 要购买的彩票数量
 */
class Lottery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Openingtime: FormatTime(),
      CurrentPeriod: 1000,
      currentHeadBlocNumber: 0,
      PurchaseNumber:0,
      lotteryNumber: "",
      amount: "",
      lastAwarded:"",
      setUoOpentTime: "",
      loadingBuy:false,
      loadingSet:false,
    };
  }
  async componentDidMount() {
    this.Initialization_request()
    this.timer=setInterval(()=>{
      if(!document.hidden){
        this.Initialization_request()
      }
    },5000)
  }

  async Initialization_request(){
    const { AmountOfBets, CurrentPeriod, Openingtime,PurchaseNumber,lastAwarded } = await getData(
      `${myserver}/lottery`
    );
    this.setState({
      Openingtime:Openingtime,
      CurrentPeriod: CurrentPeriod,
      AmountOfBets: AmountOfBets,
      PurchaseNumber:PurchaseNumber,
      lastAwarded
    });
  }
  Buylottery = async () => {
    const { lotteryNumber, amount } = this.state;
    const {userName,priKey}=this.props
    if(!userName ||!priKey ){
      return alert("请输入账号和密码");
    }
    if (!lotteryNumber) {
      return alert("请输入你要购买的彩票号码");
    }
    try {
      this.setState({
        loadingBuy:true
      })
      await gamebank.broadcast.contractCallAsync(
        priKey,
        userName,
        "lotterytest",
        "buy",
        JSON.stringify([String(lotteryNumber), Number(amount)])
      );
      this.setState({
        loadingBuy:false
      })
      alert("购买成功");
    } catch (err) {
      this.setState({
        loadingBuy:false
      })
      alert(err.message);
    }
  };
  chagelotteryNumber = e => {

    this.setState({
      lotteryNumber:e.target.value
    });
  };
  chagelotteryAmount = value => {
    this.setState({
      amount: value
    });
  };
  setUp = async () => {
    let {setUoOpentTime } = this.state;
    const {userName,priKey}=this.props

    if (!userName || !priKey || !setUoOpentTime) {
      return alert("请确保账号密码和要设置的时间都输入")
    }
    this.setState({
      loadingSet:true
    })
    const { head_block_number } = await postData(
      `${myserver}/API/api/getDynamicGlobalPropertiesAsync`,
      []
    );   
   const setUpBlockNum = setUoOpentTime * 20 + head_block_number;
      
    try {
      await gamebank.broadcast.contractCallAsync(
        priKey,
        userName,
        "lotterytest",
        "testcommand",
        JSON.stringify([
          "setdrawblocknumsetdrawblocknum",
          String(setUpBlockNum - head_block_number)
        ])
      );
      this.setState({
        loadingSet:false
      })
      alert("设置成功");
    } catch (err) {
      this.setState({
        loadingSet:false
      })
      alert(err.message);
    }
  };
  render() {
    const {
      Openingtime,
      CurrentPeriod,
      AmountOfBets,
      loadingBuy,
      loadingSet,
      lastAwarded,
      PurchaseNumber = 0
    } = this.state;

    return (
      <div>
        <h2>Gamebank彩票合约Demo</h2>
        <div className={Styles.lotteryMessage}>
          <p>
            当前彩票奖池:
            {`  ${AmountOfBets / 1000} GB`}
          </p>
          <p>
            当前彩票期数:
            {CurrentPeriod}
          </p>
          <p>
            当前购买人数:
            {PurchaseNumber}
          </p>
          <p>
            开奖时间:
            {Openingtime}
          </p>
          <p>
            上一期开奖号码:{lastAwarded}
          </p>
        </div>
        <div className="inputMessage">
          <Input
            className={Styles.NumberInput}
            value={this.state.lotteryNumber}
            placeholder="购买号码(3位数的数字)"
            min={0}
            onChange={this.chagelotteryNumber}
          />
          <InputNumber
            className={Styles.NumberInput}
            value={this.state.amount}
            min={1}
            placeholder="购买数量"
            onChange={this.chagelotteryAmount}
          />
          <Button loading={loadingBuy} onClick={this.Buylottery} type="primary" style={{marginLeft:"20px" }}>购买</Button>
        </div>
        <br />
        <div>
          <InputNumber
            style={{ width: "280px" }}
            value={this.state.setUoOpentTime}
            placeholder="设置开奖时间(如:15,代表15分钟后开奖))"
            type="number"
            onChange={value => this.setState({ setUoOpentTime: value})}
          />
          <Button loading={loadingSet} type="primary" style={{ width: "200px",marginLeft:"20px" }} onClick={this.setUp}>
            临时设置本期开奖时间
          </Button>
        </div>
        <div style={{paddingTop:"20px"}}>
          <p>
            1:彩票开奖号码的生成算法,在开奖前10分钟停止购买彩票,开奖时,以最近10分钟的区块数据作为随机数因子进行随机,生成中奖彩票号码
          </p>
          <p>2:即可保证无人能提前预知中奖彩票号码.</p>
          <p>3:开奖前10分钟不能购买.</p>
          <p>4:默认开奖时间为24小时.</p>
        </div>
      </div>
    );
  }
}
export default Lottery;
