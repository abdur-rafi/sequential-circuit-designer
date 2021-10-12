import React from 'react'
import { useState } from 'react'
import FuncionEquation from './FunctionEquation';
import { generateKMap, simplifyFunction, truthTableFromMinterms } from './helperFunctions';
import { kMap, simplifyFunctionReutnType, tabulationGroupItem, truthTable } from './interfaces';
import KMap from './kMap';
import PrimeImplicants from './PrimeImplicants';
import styles from '../../styles/design.module.scss'

const TabualationTableCell : React.FC<{
    rowIndex : number,
    columnIndex : number,
    items : tabulationGroupItem[]
}> = (props)=>{
    let indexes : number[] = [];
    for(let i = 0; i <= props.columnIndex; ++i){
        indexes.push(i + props.rowIndex);
    }
    let afterRows : React.ReactNode[] = [];
    for(let i = 1; i < props.items.length; ++i){
        afterRows.push(
            <tr key = {i}>
                <td>
                    {
                        props.items[i].comb
                    }
                </td>
                <td>
                    {
                       props.items[i] && Array.from(props.items[i].minterms).map((t, index) => parseInt(t, 2) + ((index === props.items[i].minterms.size - 1) ? '' : ','))
                    }
                </td>
            </tr>
        )
    }
    return(
        
            <table className = {styles.cellTableContainer}>
                <thead>
                    <tr>
                        
                        <th>
                            {props.columnIndex === 0 ? 'cell' : 'combined cells'}
                        </th>
                        <th>
                            input combination
                        </th>
                        <th>
                            minterms
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan = {props.items.length === 0? 1 : props.items.length}>
                            {indexes.map((t, i) => t + ((i === indexes.length - 1) ? '' : ','))}
                        </td>
                        <td>
                            {
                                props.items.length > 0 && props.items[0].comb
                            }
                        </td>
                        <td>
                            {
                                props.items.length > 0 && 
                                props.items[0].minterms && Array.from(props.items[0].minterms).map((t, i) => parseInt(t, 2) + ((i === props.items[0].minterms.size - 1) ? '' : ','))
                            }
                        </td>
                    </tr>
                    {afterRows}

                </tbody>
            </table>
        
    )
}

const TabulationTable : React.FC<{
    allGroups : tabulationGroupItem[][][],
    vars : string[]
}> = (props)=>{

    let TableHeader = ()=>{
        return(
            <thead>
                <tr>
                    {
                        props.allGroups.map((val, index)=>{
                            return(
                                <th key = {index}>
                                    {
                                        props.vars.map(v => v+' ')
                                    }  
                                </th>
                            )
                        })
                    }
                </tr>
            </thead>
        )
    }
    let mx = props.allGroups[0].length;
    
    let TableBody = ()=>{
        let key = 0;
        let row : React.ReactNode[] = [];
        for(let i = 0; i < mx;++i){
            let columns : React.ReactNode[] = [];
            for(let j = 0; j < props.allGroups.length; ++j){
                if(i < props.allGroups[j].length){
                    columns.push(
                        <td key = {key++}>
                            {
                                <TabualationTableCell items = {props.allGroups[j][i]} rowIndex = {i} columnIndex = {j}  />
                                // props.allGroups[j][i].map(t =>{
                                //     return(
                                //         <div>
                                //             {t.comb}

                                //         </div>
                                //     )
                                // })
                            }
                        </td>
                    )
                }
            }
            row.push(
                <tr>
                    {columns}
                </tr>
            )
        }
        return(
            <tbody>
                {row}
            </tbody>
        )
    }

    return(
        <div className = {styles.tabulationTableContainer}>
            <table className = {styles.tabulationTable}>
                <TableHeader/>
                <TableBody/>
            </table>
        </div>
    )
}


const MinimizeFunction : React.FC<{
    useTabulaion? : boolean
}> = (props)=>{
    
    // const [numberOfInputVars, setNumberOfInputVars] = useState<number>(3);
    const [functionTerms, setFunctionTerms] = useState<string>('');
    const [dontCares, setDontCares] = useState<string>('');
    const [variables, setVariables] = useState<string>('');
    const [error, setError] = useState<{type : 'vars' | 'terms' | 'dontCares',message : string} | null>(null);
    // const [truthTable, setTruthTable] = useState<truthTable | null>(null);
    const [kMap, setKMap] = useState<kMap | null>(null);
    const [implicants, setImplicants] = useState<simplifyFunctionReutnType|null> (null);

    const [sumOfMinterm, setSumOfMinterm] = useState<boolean>(true);

    let regex = /\s*,\s*/;


    const getRemainingTerms = (terms : number[], dontCares : number[], max : number)=>{
        let remTerms : number[] = [];
        for(let i = 0; i <= max; ++i){
            if(terms.indexOf(i) === -1 && dontCares.indexOf(i) === -1){
                remTerms.push(i);
            }
        }
        return remTerms;
    }

    const validate = () =>{
        const doesContainOtherThandigits = (l : string)=>{
            for(let i = 0; i < l.length; ++i){
                if(!Number.isInteger(parseInt(l[i]))){
                    return true;
                }
            }
            return false;
        }
        let vars = variables.trim().split(regex);
        console.log(vars);
        let n = vars.length;
        if(variables.trim().length === 0){
            setError({
                type : 'vars',
                message : 'no variables given'
            })
            return false;
        }
        if(functionTerms.trim().length === 0){
            setError({
                type : 'terms',
                message : 'no terms given'
            })
        }
        for(let i = 0; i < n; ++i){
            if(vars[i].length === 0 || vars[i].split(/\s/).length > 1){
                setError({
                    type : 'vars',
                    message : 'variables should contain no whitespace and be separated by comma'
                })
                return false;
            }
        }
        
        let maxTermNumber = (1 << n) - 1;
        let terms = functionTerms.trim().split(regex);
        // console.log(terms);
        let termsSet = new Set<number>();
        for(let i = 0; i < terms.length;++i){
            let t = parseInt(terms[i]);
            if(doesContainOtherThandigits(terms[i])){
                setError({
                    type : 'terms',
                    message : 'terms should be interger'
                })
                return false;
            }
            if(t > maxTermNumber){
                setError({
                    type : 'terms',
                    message : `term(s) exceed ${maxTermNumber}` 
                })
                return false;
            }
            termsSet.add(t);
        }
        let dontCareTerms : string[] = [];
        if(dontCares.trim().length !== 0){

            dontCareTerms = dontCares.trim().split(regex);
            for(let i = 0; i < dontCareTerms.length;++i){
                let t = parseInt(dontCareTerms[i]);
                if(doesContainOtherThandigits(dontCareTerms[i])){
                    setError({
                        type : 'dontCares',
                        message : 'terms should be integer'
                    })
                    return false;
                }
                if(t > maxTermNumber){
                    setError({
                        type : 'dontCares',
                        message : `term(s) exceed ${maxTermNumber}` 
                    })
                    return false;
                }
                if(termsSet.has(t)){
                    setError({
                        type : 'dontCares',
                        message : `duplicate entries in terms and don't cares` 
                    })
                    return false;
                }
            }
        }

        let termsNumber = terms.map(term => parseInt(term));
        let dontCaresNumber : number[] = [];
        if(dontCares.trim().length !== 0){
            dontCaresNumber = dontCareTerms.map(term => parseInt(term));
        }

        if(!sumOfMinterm){
            termsNumber = getRemainingTerms(termsNumber, dontCaresNumber,maxTermNumber);
        }
        

        truthTableFromMinterms(termsNumber, vars, dontCaresNumber)
        .then(async tr =>{
            let k = await generateKMap(tr);
            let r = simplifyFunction(tr, true);
            setImplicants(r);
            setKMap(k);
        })

        return true;

    }

    const resetError = (type : 'vars' | 'terms' | 'dontCares')=>{
        if(error && error.type === type){
            setError(null);
        }
    }

    return(
        <div>
            <div>
                Variables:
                <input type = 'text' onChange = {(e)=>{
                        setVariables(e.target.value);
                        resetError('vars')
                    }} value = {variables} />
                <div>
                    {error && error.type === 'vars' && error.message}
                </div>
            </div>
            <div>
                    <select onChange = {(e)=>{
                        if(e.target.value === 'sum of minterms'){
                            setSumOfMinterm(true);
                        }
                        else{
                            setSumOfMinterm(false);
                        }
                    }} defaultValue = {'sum of minterms'} >
                        <option> sum of minterms </option>
                        <option> product of maxterms </option>
                    </select>
                
                {' '} of {' '}
                    
                <input type = 'text' onChange = {(e)=>{
                        setFunctionTerms(e.target.value);
                        resetError('terms')
                    }} value = {functionTerms} />
                <div>
                    {error && error.type === 'terms' && error.message}
                </div>
            </div>
            <div>
                don't cares:
                <input type = 'text' onChange = {(e)=>{
                        setDontCares(e.target.value);
                        resetError('dontCares');
                    }} value = {dontCares} />
                <div>
                    {error && error.type === 'dontCares' && error.message}
                </div>
            </div>
            <div>
                <button onClick = {()=>validate()}> Generate Kamp </button>
            </div>
            <div>
                {
                   !props.useTabulaion && kMap && <KMap kMap = {kMap} />
                    
                }
                {
                    props.useTabulaion && implicants && <TabulationTable allGroups = {implicants.groupsPerStep!} vars = {variables.trim().split(regex)} />
                }
                {
                    implicants && <FuncionEquation vars = {variables.trim().split(regex)} functionName = {'f'} r = {implicants} />
                }
                
                {
                    implicants && <PrimeImplicants vars = {variables.trim().split(regex)} r = {implicants} />
                }
                
            </div>
        </div>
    )
}

export default MinimizeFunction;