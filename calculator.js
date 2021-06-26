const handleUpdateCondition = (
  dbs,
  db_name,
  tb,
  type,
  op_list,
  operator,
  newKV
) => {
  op_list.forEach((cond) => {
    for (op in operatorMap) {
      let op_match = cond.match(operatorMap[op]);
      if (op_match) {
        operator[op_match[1]] = { operator: op, value: op_match[2] };
      }
    }
  });
  let returnDATA = dbs[db_name]?.[tb]?.data.map((item) => {
    let flag = true;
    for (props in operator) {
      let check_value =
        dbs[db_name]?.[tb]?.data[props] == "int"
          ? eval(operator[props].value)
          : operator[props].value;
      switch (operator[props].operator) {
        case "GE": {
          if (item[props] >= check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "GT": {
          if (item[props] > check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "EQ": {
          if (item[props] == check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "LE": {
          if (item[props] <= check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "LT": {
          if (item[props] < check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
      }
    }
    if (flag) {
      return { ...item, ...newKV };
    } else return item;
  });
  return returnDATA;
};

const handleCondition = (
  dbs,
  db_name,
  tb,
  type,
  op_list,
  operator,
  isDelete = false
) => {
  op_list.forEach((cond) => {
    for (op in operatorMap) {
      let op_match = cond.match(operatorMap[op]);
      if (op_match) {
        operator[op_match[1]] = { operator: op, value: op_match[2] };
      }
    }
  });
  let returnDATA = dbs[db_name]?.[tb]?.data.filter((item) => {
    let flag = true;
    for (props in operator) {
      let check_value =
        dbs[db_name]?.[tb]?.data[props] == "int"
          ? eval(operator[props].value)
          : operator[props].value;
      switch (operator[props].operator) {
        case "GE": {
          if (item[props] >= check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "GT": {
          if (item[props] > check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "EQ": {
          if (item[props] == check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "LE": {
          if (item[props] <= check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
        case "LT": {
          if (item[props] < check_value) flag = type == "and" ? flag : true;
          else flag = type == "and" ? false : flag;
          break;
        }
      }
    }
    return isDelete ? !flag : flag;
  });
  return returnDATA;
};
module.exports = {
  handleCondition,
  handleUpdateCondition,
};
