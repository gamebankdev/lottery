const Koa = require("koa");
const app = new Koa();
const koaBody = require("koa-body");
const router = require("./Routes/API");
const cors = require("koa2-cors");
const request = require("axios");
const fs = require("fs");
const gamebank = require("gamebank");
const Customer = require("config").get("Customer");
gamebank.api.setOptions({ url: Customer.gamebankOption.server });
gamebank.config.set("address_prefix", Customer.gamebankOption.address_prefix);
gamebank.config.set("chain_id", Customer.gamebankOption.chain_id);

//请求链上最新的区块
const request_head_block_number = async read_head_block_number => {

  const {
    head_block_number
  } = await gamebank.api.getDynamicGlobalPropertiesAsync();
  global.last_head_block_number = head_block_number;

  requestBlockChain(read_head_block_number);

  global.timer = setInterval(async () => {
    const {
      head_block_number
    } = await gamebank.api.getDynamicGlobalPropertiesAsync();

    global.last_head_block_number = head_block_number;
    const { transactions = [] } = await gamebank.api.getBlockAsync(
      head_block_number
    );
    if (transactions.length > 0) {
      global.blockInformation.push(head_block_number);
      if (global.blockInformation.length > 9) {
        global.blockInformation = global.blockInformation.slice(
          global.blockInformation.length - 10
        );
      }
    }
    requestBlockChain(head_block_number);
  }, 3000);
};
//获取当前最新的初始合约块信息
const requestBlockChain = async head_block_number => {
  try {
    if (head_block_number > global.last_head_block_number) {
      return false;
    }
    console.log(
      "head_block_number",
      head_block_number,
      global.last_head_block_number
    );
    global.has_request_block_number = head_block_number;
    var formData = {
      id: 0,
      jsonrpc: "2.0",
      method: "call",
      params: ["condenser_api", "get_contract", [head_block_number]]
    };
    const { data = {} } = await request({
      url: Customer.gamebankOption.server,
      method: "POST",
      data: formData,
      headers: {
        "Content-type": "application/json"
      }
    });
    let result = data.result;
    if (result == null || result == undefined) {
      result = {};
    }
    const { transactions = [] } = result;

    transactions.forEach(ele => {
      new Promise((resolve, reject) => {
        const { operations = [] } = ele;
        operations.forEach((value = []) => {
          const [contract_log, info] = value;
          if (contract_log == "contract_log") {
            const { name, data = JSON.stringify({}) } = info;
            const formatData = JSON.parse(data);
            if (name == "lotterytest") {
              const { info, buy, draw } = formatData;
              console.log(info, buy, draw);
              if (info) {
                fs.writeFileSync(
                  "./file/contract.txt",
                  JSON.stringify({
                    ...formatData,
                    wrtieTime: new Date(),
                    read_head_block_number: head_block_number
                  })
                );
                /**
                 * currentAmountOfBets number 当前下注数量
                 * CurrentPeriod number 当前期数
                 * currentOpeningtime  number 当前开奖时间(实际记录的是区块)
                 */
                global.currentAmountOfBets = info[2];
                global.CurrentPeriod = info[0];
                global.currentOpeningtime = info[1];
                global.PurchaseNumber = [];
              } else if (buy) {
                global.PurchaseNumber.push(buy[0]);
                global.currentAmountOfBets =
                  global.currentAmountOfBets + Number(buy[2]) * 2000;
                console.log(global.currentAmountOfBets);
              } else if (draw) {
                global.lastAwarded = draw[1];
              }
            }
          }
        });
      });
    });
    return requestBlockChain(head_block_number + 1);
  } catch (err) {
    request_head_block_number(read_file_contract_number());
    fs.writeFileSync("./file/err.txt", JSON.stringify(err));
  }
};
//读取本地文件,获取上一次记录的合约区块高度
const read_file_contract_number = () => {
  const { read_head_block_number, info } = JSON.parse(
    fs.readFileSync("./file/contract.txt", "utf-8")
  );
  global.CurrentPeriod = info[0];
  global.currentOpeningtime = info[1];
  global.currentAmountOfBets = info[2];
  global.PurchaseNumber = [];
  global.blockInformation = [];
  return read_head_block_number + 1;
};
request_head_block_number(read_file_contract_number());

app
  .use(
    cors({
      origin: "*",
      credentials: true,
      allowMethods: ["GET", "POST"]
    })
  )
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(5000);
