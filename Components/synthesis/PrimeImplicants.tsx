import React from 'react'
import { getInputCombination, getLiteral } from './helperFunctions';
import { circuitMode, simplifyFunctionReutnType } from './interfaces'
import styles from '../../styles/equationAndImplicants.module.scss'

const PrimeImplicants : React.FC<{
    r : simplifyFunctionReutnType,
    vars : string[],
    numberOfInputs : number,
    circuitMode : circuitMode
}> = (props)=>{
    let key = 0;
    let allPis = '';
    let pulses : string[] = ['']
    if(props.circuitMode === 'pulse'){
        pulses = getInputCombination(props.numberOfInputs, props.circuitMode);
    }
    pulses.forEach(p=>{

        props.r[p].PIs.forEach(e=> allPis+= p + getLiteral(e.comb, props.vars, props.circuitMode) + ' , ' );
    })
    allPis = allPis.slice(0, allPis.length - 3);

    let epis = '';
    pulses.forEach(p=>{
        props.r[p].EPIs.forEach(e=> epis+= p + getLiteral(e.comb, props.vars, props.circuitMode) + ' , ' );
    })
    epis = epis.slice(0, epis.length - 3);

    
    return(
        <div className = {styles.implicantContainer} >
            <div>
                All Prime Implicants: {' '} 
                {allPis.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)}
            </div>

            <div>
                Essential Prime Implicants: {' '} 
                {epis.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)}
            </div>


        </div>

    )
}

export default PrimeImplicants;