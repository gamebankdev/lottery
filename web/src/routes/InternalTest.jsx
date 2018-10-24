import React, { Component } from "react";
import { postData } from "../util/fetchUrl";
import { blockServer } from "../../config";
import { Select, Input, Button } from "antd";
import Myinput from "../components/Input.jsx";
import gamebank from "../util/gamebank";
const Option = Select.Option;
const { TextArea } = Input;

class InternalTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: [],
      funcMessga: [],
      showInput: false,
      args: [],
      userName: "",
      priKey: "",
      theContractsFunc: {
        args: []
      },
      loading:false,
      inputArgs: [],
      result: ""
    };
  }
  async componentDidMount() {
    //请求合约列表
    postData(blockServer, {
      id: 0,
      jsonrpc: "2.0",
      method: "call",
      params: ["condenser_api", "list_contracts", []]
    })
      .then(res => {
        this.setState({
          contracts: res
        });
      })
      .catch(err => {
     
      });
  }
  //选择合约
  choseContract = async value => {
    const { abi } = await postData(blockServer, {
      id: 0,
      jsonrpc: "2.0",
      method: "call",
      params: ["condenser_api", "find_contracts", [value]]
    })
    this.setState({
      currentContract: value,
      funcMessga: JSON.parse(abi)
    });
  };
  //选择合约的方法
  choseFunc = value => {
    const func = JSON.parse(value);
    this.setState({
      theContractsFunc: { ...func },
      showInput: true,
      args:[],
      result:""
    });
  };
  //设置参数值
  changeArgs(value, index) {
    const { args } = this.state;
    args[index] = value;
    this.setState({
      args
    });
  }
  request = () => {
    const { userName, priKey } = this.props;
    const { currentContract, theContractsFunc, args } = this.state;
    if(!userName || !priKey){
      return alert("请输入账号和密码")
    }
    this.setState({
      loading:true
    })
    gamebank.broadcast
      .contractCallAsync(
        priKey,
        userName,
        currentContract,
        theContractsFunc.name,
        JSON.stringify(args)
      )
      .then(res => {
        this.setState({
          result: res,
          loading:false
        });
      })
      .catch(err => {
        this.setState({
          result: err.message,
          loading:false
        });
      });
  };
  render() {
    const {
      contracts,
      funcMessga,
      theContractsFunc,
      showInput,
      result
    } = this.state;
    return (
      <div className="App">
        <div className="container">
          <div className="header">
            <div>
              <Select
                placeholder="请选择合约"
                style={{ width: 180 }}
                onChange={this.choseContract}
              >
                {contracts.map((ele, index) => {
                  return (
                    <Option key={index}   value={ele}>
                      <p>{ele}</p>
                    </Option>
                  );
                })}
              </Select>
            </div>
          </div>
          <div className="content">
            <div style={{ paddingTop: "20px" }}>
              <p>合约信息</p>
              <TextArea
                value={funcMessga.length>0?JSON.stringify(funcMessga):null}
                placeholder="请选择合约,将会看到合约信息"
                autosize={{ minRows: 2, maxRows: 6 }}
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              <Select
                placeholder="选择合约的方法"
                style={{ width: 180 }}
                onChange={this.choseFunc}
              >
                {funcMessga.map((item, index) => {
                  return (
                    <Option key={index} style={{padding:"20px 0"}} value={JSON.stringify(item)}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </div>
            {showInput && (
              <div style={{ paddingTop: "20px" }}>
                <p>输入参数</p>
                {theContractsFunc.args.map((item, index) => {
                  return (
                    <div key={index} style={{ padding: "10px 0" }}>
                      <Myinput
                        currrnt={index}
                        onChange={(value, index) =>
                          this.changeArgs(value, index)
                        }
                        placeholder={item}
                        type={item}
                      />
                    </div>
                  );
                })}
                <Button loading={this.state.loading} onClick={this.request}>点击执行</Button>
                <div style={{ paddingTop: "10px" }}>
                  <span>执行结果</span>
                  <div>{JSON.stringify(result)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default InternalTest;
