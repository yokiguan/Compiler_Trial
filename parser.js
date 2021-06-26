const { handleCondition, handleUpdateCondition } = require("./calculator");
const operatorMap = {
  GE: /(.*)>=(.*)/,
  GT: /(.*)>(.*)/,
  EQ: /(.*)=(.*)/,
  LE: /(.*)<=(.*)/,
  LT: /(.*)<(.*)/,
};
const parseCommand = (db_name, dbs, state, res) => {
  let result = { db_name, dbs, state, res };
  switch (state) {
    case "useDBSQL":
      result = { ...result, db_name: res[1], data: { foldername: res[1] } };
      break;
    case "showDBSQL":
      result = { ...result, data: { dbs: Object.keys(dbs) } };
      break;
    case "showTBSQL":
      result = { ...result, data: { dbs: Object.keys(dbs[db_name]) } };
      break;
    case "dropDBSQL": {
      delete dbs[res[1]];
      result = { ...result, dbs, data: { foldername: res[1] } };
      break;
    }
    case "dropTBSQL": {
      delete dbs[db_name][res[1]];
      result = { ...result, db_name: "", dbs, data: { filename: res[1] } };
      break;
    }
    case "createDBSQL":
      dbs[res[1]] = {};
      result = { ...result, dbs, data: { filename: res[1] } };
      break;
    case "createTBSQL": {
      if (db_name == "") break;
      let types = {};
      res[2].split(",").forEach((i) => {
        let [props, type] = i.split(" ");
        types[props] = type;
      });
      let tb_name = res[1];
      dbs[db_name][tb_name] = { format: types, data: [] };
      result = { ...result, dbs, data: { filename: res[1], types } };
      break;
    }
    case "insertWithConditionSQL": {
      let tb = res[1];
      let tb_format = dbs[db_name][tb].format;
      let props = res[2].split(",");
      let values = res[3].split(",");
      let temptData = {};
      props.forEach((p, index) => {
        if (p in tb_format) {
          temptData[p] = eval(values[index]);
        }
      });
      dbs[db_name][tb].data.push(temptData);
      result = { ...result, dbs, data: { filename: res[1], dbs } };
      break;
    }
    case "insertSQL": {
      let tb = res[1];
      let tb_format = dbs[db_name][tb].format;
      let values = res[2].split(",");
      let temptData = {};
      Object.keys(tb_format).forEach((p, index) => {
        temptData[p] = eval(values[index]);
      });
      dbs[db_name][tb].data.push(temptData);
      result = { ...result, dbs, data: { filename: res[1], dbs } };
      console.log("this is temptData", tb_format, temptData);
      break;
    }
    case "deleteSQL": {
      let tb = res[1];
      let kv = res[2];
      let and_op = kv.split(" AND ");
      let or_op = kv.split(" OR ");
      let operator = {};
      let type_and_or = and_op.length >= 1 ? "and" : "or";
      let op_list = and_op.length >= 1 ? and_op : or_op;
      let newdb = handleCondition(
        dbs,
        db_name,
        tb,
        type_and_or,
        op_list,
        operator,
        true
      );
      dbs = newdb;
      result = { ...result, dbs, data: { newdb: dbs } };
      console.log("newDB", newdb);
      break;
    }
    case "updateWithConditionSQL": {
      let newKV = {};
      res[2].split(",").forEach((i) => {
        let [key, value] = i.split("=");
        if (dbs[db_name][res[1]].format[key] === "int") value = eval(value);
        newKV[key] = value;
      });
      let kv = res[3];
      let and_op = kv.split(" AND ");
      let or_op = kv.split(" OR ");
      let operator = {};
      let type_and_or = and_op.length >= 1 ? "and" : "or";
      let op_list = and_op.length >= 1 ? and_op : or_op;
      let newdbs = handleUpdateCondition(
        dbs,
        db_name,
        res[1],
        type_and_or,
        op_list,
        operator,
        newKV
      );
      break;
    }
    case "updateSQL": {
      let newKV = {};
      res[2].split(",").forEach((i) => {
        let [key, value] = i.split("=");
        if (dbs[db_name][res[1]].format[key] === "int") value = eval(value);
        newKV[key] = value;
      });
      let newdbs = handleUpdateCondition(
        dbs,
        db_name,
        res[1],
        "and",
        [],
        {},
        newKV
      );
      break;
    }
    case "selectWithConditionSQL": {
      let props = res[1];
      let tb = res[2];
      let isAll = props.match(/^\*$/);
      let kv = res[3].match(/^\((.*)\)$/)?.[1];
      if (kv)
        while (1) {
          let reg = kv.match(/^\((.*)\)$/i);
          if (!reg) {
            break;
          } else {
            kv = reg[1];
          }
        }
      else kv = res[3];
      let operator = {};
      let and_op = kv.split(" AND ");
      let or_op = kv.split(" OR ");

      let type_and_or = and_op.length >= 1 ? "and" : "or";
      let op_list = and_op.length >= 1 ? and_op : or_op;

      let r =
        handleCondition(dbs, db_name, tb, type_and_or, op_list, operator) || [];
      if (isAll) result = { ...result, data: { select: r } };
      else {
        props = props.split(",");
        result = {
          ...result,
          data: {
            select: r.map((item) => {
              let newItem = {};
              props.forEach((p) => {
                newItem[p] = item[p];
              });
              return newItem;
            }),
          },
        };
      }
      break;
    }
    case "selectSQL": {
      let props = res[1];
      let tb = res[2];
      let isAll = props.match(/^\*$/);
      if (isAll)
        result = { ...result, data: { select: dbs[db_name][tb].data } };
      else {
        props = props.split(",");
        result = {
          ...result,
          data: {
            select: dbs[db_name][tb].data.map((item) => {
              let newItem = {};
              props.forEach((p) => {
                newItem[p] = item[p];
              });
              return newItem;
            }),
          },
        };
      }
      break;
    }
  }
  return result;
};

module.exports = parseCommand;
