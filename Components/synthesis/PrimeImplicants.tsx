import React from 'react'
import { getLiteral } from './helperFunctions';
import { simplifyFunctionReutnType } from './interfaces'
import styles from '../../styles/equationAndImplicants.module.scss'

const PrimeImplicants : React.FC<{
    r : simplifyFunctionReutnType,
    vars : string[]
}> = (props)=>{
    let key = 0;
    let allPis = '';
    props.r.PIs.forEach(e=> allPis+= getLiteral(e.comb, props.vars) + ' , ' );
    allPis = allPis.slice(0, allPis.length - 3);

    let epis = '';
    props.r.EPIs.forEach(e=> epis+= getLiteral(e.comb, props.vars) + ' , ' );
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