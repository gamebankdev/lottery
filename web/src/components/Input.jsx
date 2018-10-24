import {Input,InputNumber } from 'antd'
import React from 'react'
class MyInput extends React.Component{
    numberInput=(value)=>{
        this.props.onChange(value,this.props.currrnt)
    }
    stringInput=(e)=>{
        this.props.onChange(e.target.value,this.props.currrnt)
    }
    render(){
        const {type}=this.props
        return(
          <div>
              {
                  type=='string'?
                  <Input placeholder={type}  onChange={this.stringInput}/>
                  :type=='uint64'||type=='int'?
                  <InputNumber placeholder={type}  onChange={this.numberInput} />:null
              }
          </div>
        )
    }
}
export default MyInput