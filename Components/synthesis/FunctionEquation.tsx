import React from 'react'
import { getLiteral } from './helperFunctions';
import { simplifyFunctionReutnType, tabulationGroupItem } from './interfaces';


let FuncionEquation : React.FC<{
    functionName : string,
    r : simplifyFunctionReutnType,
    vars : string[]
}> = (props)=>{
    let key = 0;
    let s = '';
    props.r.selectedPIs.forEach(e=> s+= getLiteral(e.comb, props.vars) + ' + ' );
    s = s.slice(0, s.length - 3);
    if(s == '')
        s = '0'
return(
        <div> 
            {props.functionName.split('').map
            (c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} = {s.split('').map
            (c => Number.isInteger(Number.parseInt(c)) ? <sub key={key++}>{c}</sub> : c  )} 
        </div>

    )
}

export default FuncionEquation;