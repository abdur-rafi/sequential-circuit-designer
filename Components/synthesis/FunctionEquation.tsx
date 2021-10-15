import React from 'react'
import { getInputCombination, getLiteral } from './helperFunctions';
import { circuitMode, simplifyFunctionReutnType, tabulationGroupItem } from './interfaces';
import styles from '../../styles/equationAndImplicants.module.scss'

let FuncionEquation : React.FC<{
    functionName : string,
    r : simplifyFunctionReutnType,
    vars : string[],
    circuitMode : circuitMode,
    numberOfInputs : number
}> = (props)=>{
    let key = 0;
    let s = '';
    let pulses : string[] = ['']
    if(props.circuitMode === 'pulse'){
        pulses = getInputCombination(props.numberOfInputs, props.circuitMode);
    }
    pulses.forEach(p=>{
        props.r[p].selectedPIs.forEach(e=> s+= p + getLiteral(e.comb, props.vars, props.circuitMode) + ' + ' );
    })
    s = s.slice(0, s.length - 3);
    if(s == '')
        s = '0'
return(
        <div className = {styles.equationContainer} > 
            {props.functionName.split('').map
            (c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} = {s.split('').map
            (c => Number.isInteger(Number.parseInt(c)) ? <sub key={key++}>{c}</sub> : c  )} 
        </div>

    )
}

export default FuncionEquation;