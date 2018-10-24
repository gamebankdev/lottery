const Router = require("koa-router");
const router = new Router();
const gamebank = require("gamebank");
const Customer = require("config").get("Customer");
router.post("/API/:attribute/:method", ctx => {
  return new Promise((resolve, reject) => {
    const { attribute, method } = ctx.params;
    let params = ctx.request.body;
    let generateKeys = null;
    const userName = params[0];
    const password = params[1];
    if (attribute == "broadcast" && method == "accountCreate") {
      if (params.length != 2 || userName == "" || password == "") {
        throw "Parameter error";
      }
      const wif = Customer.initAcoount.wif;
      const initName = Customer.initAcoount.initName;
      const fee = Customer.initAcoount.fee;
      generateKeys = gamebank.auth.generateKeys(userName, password, [
        "owner",
        "active",
        "posting",
        "memo"
      ]);
      const metadata = "";
      const owner = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[generateKeys.owner, 1]]
      };
      const active = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[generateKeys.active, 1]]
      };
      const posting = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[generateKeys.posting, 1]]
      };
      const memoKey = generateKeys.memo;
      const arr = [];
      arr.push(
        wif,
        fee,
        initName,
        params[0],
        owner,
        active,
        posting,
        memoKey,
        metadata
      );
      params = arr;
    }
    params.push(function(err, result) {
      if (err) {
        reject(err);
      } else {
        if (generateKeys) {
          const private = gamebank.auth.getPrivateKeys(userName, password, [
            "posting",
            "active",
            "owner",
            "memo"
          ]);
          resolve([
            {
              keyValue: private.posting,
              key: 1,
              keyName: "posting",
              extra: "发帖,点赞等操作"
            },
            {
              keyValue: private.active,
              key: 2,
              keyName: "active",
              extra: "转账,交易等操作"
            },
            {
              keyValue: private.owner,
              key: 3,
              keyName: "owner",
              extra: "恢复账号等操作"
            },
            {
              keyValue: private.memo,
              key: 4,
              keyName: "memo",
              extra: "备注等操作"
            }
          ]);
        } else {
          resolve(result);
        }
      }
    });

    var paramArr = params.map(element => {
      if (element == null) {
        return undefined;
      } else {
        return element;
      }
    });

    gamebank[attribute][method].apply(null, paramArr);
  })
    .then(res => {
      ctx.body = {
        data: res,
        success: true,
        code: 200
      };
      ctx.status = 200;
    })
    .catch(err => {
      console.log(err);
      ctx.body = {
        data: err,
        success: false,
        code: 400
      };
      ctx.status = 400;
    });
});

function formateTime(time=Date.now()){
  const FormatTime=new Date(time)
  const Year=FormatTime.getFullYear()
  const Month=FormatTime.getMonth()+1
  const Day=FormatTime.getDate()
  const Hours=FormatTime.getHours()
  const Minutes=FormatTime.getMinutes()
  return `${Year}-${Month}-${Day}   ${Hours}:${Minutes}`
}

router.get("/lottery", async ctx => {
  const {
    head_block_number
  } = await gamebank.api.getDynamicGlobalPropertiesAsync();
  ctx.body = {
    code: 200,
    data: {
      AmountOfBets: global.currentAmountOfBets,
      CurrentPeriod: global.CurrentPeriod,
      Openingtime: formateTime(Date.now()+(global.currentOpeningtime - head_block_number) * 3000) ,
      PurchaseNumber: [...new Set(global.PurchaseNumber)].length,
      lastAwarded: global.lastAwarded
    },
    success: true
  };
  ctx.status = 200;
});

router.get("/blockInformation", async ctx => {
  ctx.body = {
    code: 200,
    data: global.blockInformation,
    success: true
  };
  ctx.status = 200;
});
module.exports = router;
