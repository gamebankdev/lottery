import React from 'react'
import {Route} from 'react-router-dom'
import RegisterComponent from '../routes/Register.jsx'
import Test from '../routes/test.jsx'

export default ()=>{
    return(
        <div>
          <Route exact path="/" component={RegisterComponent} />
          <Route  path="/test" component={Test} /> 
        </div>
       
    )
}
